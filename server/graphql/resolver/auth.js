/* eslint-disable no-useless-escape */
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const pubsub = require('../pubsub').getInstance()

const Auth = require('../../models/auth')
const Docs = require('../../models/docs')
const keys = require('../../keys')
// const employee = require('./docs/employee')

moment.locale('ru')

const getUsers = async (id) => {
  const functionFind = id ? 'findOne' : 'findAll'
  const where = id ? { where: { id } } : {}
  const users = await Auth.User[functionFind]({
    attributes: [
      'id',
      'name',
      'employeeId',
      'avatar',
      'createdAt',
      'updatedAt'
    ],
    include: [
      {
        model: Auth.Group,
        attributes: [
          'id'
        ],
        through: {
          attributes: []
        }
      }
    ],
    ...where
  })
  return users
}

const formEmployees = async (ids) => {
  const employees = await getEmployees(ids)
  const employeesIndexed = []
  employees.forEach((el) => {
    let subdivisionsId = []
    const departmentsId = []
    const currentPositionsId = []
    el.CurrentPositions.forEach((el) => {
      currentPositionsId.push(el.id)
      const currentSubdivId = el.Subdivisions.reduce((acc, item) => [...acc, item.id.toString()], [])
      subdivisionsId = [...subdivisionsId, ...currentSubdivId]
      departmentsId.push(el.Department.id)
    })
    employeesIndexed[el.id] = {
      id: el.id,
      firstName: el.firstName,
      middleName: el.middleName,
      secondName: el.secondName,
      currentPositionsId,
      subdivisionsId,
      departmentsId
    }
  })
  return employeesIndexed
}

const getEmployees = async (ids) => {
  if (!ids) { return }
  console.time('getEmployees')
  const employee = await Docs.Employee.findAll({
    where: {
      id: { [Op.in]: ids }
    },
    attributes: [
      'id',
      'firstName',
      'middleName',
      'secondName'
    ],
    include: [
      {
        model: Docs.CurrentPosition,
        attributes: ['id'],
        include: [
          {
            model: Docs.Subdivision,
            attributes: ['id']
          },
          {
            model: Docs.Department,
            attributes: ['id']
          }
        ]
      }
    ]
  })
  console.timeEnd('getEmployees')
  if (!employee) { return }
  return employee
}

const formUser = (item, employees) => {
  const groupsId = item.Groups.reduce((acc, item) => [...acc, item.id.toString()], [])
  const employee = employees[item.employeeId] || {}
  return {
    id: item.id,
    name: item.name,
    employeeId: item.employeeId,
    firstName: employee?.firstName || '',
    middleName: employee?.middleName || '',
    secondName: employee?.secondName || '',
    currentPositionsId: employee?.currentPositionsId || [],
    departmentsId: employee?.departmentsId || [],
    subdivisionsId: employee?.subdivisionsId || [],
    groupsId,
    avatar: item.avatar,
    createdAt: moment(item.createdAt),
    updatedAt: moment(item.updatedAt)
  }
}

const addAvatar = async (avatar, userName) => {
  const filename = avatar.split('.')
  const message = { messageType: 'success' }
  let fileExtention
  if (filename.length > 1) {
    fileExtention = filename[filename.length - 1]
  } else {
    fileExtention = ''
  }
  let moveOK = true
  const newFileName = `avatar-${userName}.${fileExtention}`
  await fs.rename(path.join(keys.STATIC_DIR, keys.UPLOAD_STORAGE, avatar),
    path.join(keys.STATIC_DIR, keys.AVATAR_STORAGE, newFileName),
    (err) => {
      if (err) {
        message.text += `Ошибка при прикреплении файла ${avatar}: ${err}`
        message.messageType = 'error'
        moveOK = false
      }
    })
  if (moveOK) {
    message.text += `Прикрепление файла ${avatar} успешно \n\r`
    message.avatar = newFileName
  }
  return message
}

const deleteAvatarUpoad = async (fileName) => {
  const message = {}
  await fs.unlink(path.join(keys.STATIC_DIR, keys.UPLOAD_STORAGE, fileName), (err) => {
    if (err) {
      message.text += `Файл ${fileName}, ошибка: ${err}\n\r`
      message.messageType = 'error'
    }
  })
  return message
}

const deleteAvatar = async (avatar) => {
  const message = {}
  await fs.unlink(path.join(keys.STATIC_DIR, keys.AVATAR_STORAGE, avatar), async (err) => {
    if (err) {
      const uplMess = await deleteAvatarUpoad(avatar)
      if (uplMess.messageType === 'error') {
        message.text = uplMess.text
        message.messageType = uplMess.messageType
      }
    } else {
      message.text = `Файл ${avatar} успешно удалён`
    }
  })
  return message
}

module.exports = {
  async addUser (root, { user: { name, password, employeeId, avatar } }) {
    try {
      const iName = _.trim(_.replace(name, /[\[\]&{}<>#$%^*!@+\/\\`~]+/g, ''))
      const iPassword = _.trim(_.replace(password, /[\'\"\[\ \~]+/g, ''))
      if (!iName || !iPassword) {
        const message = {
          type: 'addUser',
          text: 'Имя пользователя и пароль не должны быть пустыми',
          messageType: 'error'
        }
        return message
      }
      const candidate = await Auth.User.findOne({ where: { name: iName } })
      if (candidate) {
        const message = {
          type: 'addUser',
          text: 'Пользователь с таким именем уже существует',
          messageType: 'error'
        }
        return message
      } else {
        const message = { type: 'addUser', messageType: 'success' }
        const salt = await bcrypt.genSalt(10)
        let fileMess
        if (avatar) {
          fileMess = await addAvatar(avatar, name)
        }
        if (!avatar || fileMess.messageType === 'success') {
          const newUser = await Auth.User.create({
            name: iName,
            password: await bcrypt.hash(iPassword, salt),
            employeeId,
            avatar: fileMess ? fileMess.avatar : null
          })
          message.text = 'Пользователь успешно добавлен'
          message.id = newUser.id
          message.item = JSON.stringify({ user: { name, password, employeeId, avatar: fileMess.avatar || avatar } })
          const employees = await formEmployees([candidate.employeeId])
          const rawUser = await getUsers(newUser.id)
          const user = formUser(rawUser, employees)
          pubsub.publish('USER_CHANGED', {
            userChanged: {
              type: 'add',
              id: newUser.id,
              item: user
            }
          })
        } else {
          message.messageType = 'error'
          message.text = fileMess.text
          await deleteAvatarUpoad(avatar)
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'addUser',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async editUser (root, { id, user: { name, password, employeeId, avatar } }, context) {
    try {
      const candidate = await Auth.User.findByPk(id)
      const iName = _.trim(_.replace(name, /[\[\]&{}<>#$%^*!@+\/\\`~]+/g, ''))
      const iPassword = _.trim(_.replace(password, /[\'\"\[\ \~]+/g, ''))
      if (!iName) {
        const message = {
          type: 'editUser',
          text: 'Имя пользователя не должно быть пустым',
          messageType: 'error'
        }
        return message
      }
      if (!candidate) {
        const message = {
          type: 'editUser',
          text: 'Пользователь с таким id не существует',
          messageType: 'error'
        }
        return message
      } else {
        const storedAvatar = candidate.avatar
        if (iPassword === '') {
          // Если пароль пустой, то изменяется только имя
          candidate.name = iName
        } else {
          const salt = await bcrypt.genSalt(10)
          candidate.name = iName
          candidate.password = await bcrypt.hash(iPassword, salt)
          if (employeeId) {
            candidate.employeeId = employeeId
          }
        }
        let fileMess
        if ((avatar && !storedAvatar)) {
          // добавление аватара
          fileMess = await addAvatar(avatar, candidate.name)
          if (fileMess.messageType === 'error') {
            await deleteAvatarUpoad(avatar)
          } else {
            candidate.avatar = fileMess.avatar
          }
        } else if (!avatar && storedAvatar) {
          // Удаление аватара
          fileMess = await deleteAvatar(storedAvatar)
          candidate.avatar = null
        } else if (storedAvatar && avatar && (avatar !== storedAvatar)) {
          // Редактирование аватара
          await deleteAvatar(storedAvatar)
          fileMess = await addAvatar(avatar, candidate.name)
          if (fileMess.messageType === 'error') {
            await deleteAvatarUpoad(avatar)
          } else {
            candidate.avatar = fileMess.avatar
          }
        }
        await candidate.save()
        const message = {
          type: 'editUser',
          text: 'Пользователь успешно изменён',
          messageType: 'success',
          id,
          item: JSON.stringify({ user: { name, password, employeeId, avatar } })
        }
        const employees = await formEmployees([candidate.employeeId])
        const rawUser = await getUsers(candidate.id)
        const user = formUser(rawUser, employees)
        pubsub.publish('USER_CHANGED', {
          userChanged: {
            type: 'edit',
            id: candidate.id,
            item: user
          }
        })
        if (fileMess.messageType === 'error') {
          message.messageType = 'error'
          message.text = fileMess.text
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'editUser',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async login (root, { user: { name, password } }, { req }) {
    try {
      const candidate = await Auth.User.findOne({ where: { name } })
      if (candidate) {
        const isPswd = await bcrypt.compare(password, candidate.password)
        if (isPswd) {
          const token = jwt.sign({
            name: candidate.name,
            userId: candidate.id
          }, keys.JWT, { expiresIn: keys.JWT_EXPIRES_IN })
          req.session.cookie.userId = candidate.id
          req.session.cookie.employeeId = candidate.employeeId
          const time = moment().add(moment.duration('04:00:00')).toISOString()
          req.session.cookie.expires = new Date(time)
          const message = {
            type: 'login',
            text: 'Вход успешен',
            messageType: 'success',
            token,
            UserId: candidate.id
          }
          return message
        } else {
          const message = {
            type: 'login',
            text: 'Ошибка: Пользователь с таким именем или паролем не найден',
            messageType: 'error',
            token: null
          }
          req.session.save((err) => {
            if (err) {
              console.log(`Ошибка: ${err}`)
            }
          })
          console.log(message)
          return message
        }
      } else {
        const message = {
          type: 'login',
          text: 'Ошибка: Пользователь с таким именем или паролем не найден',
          messageType: 'error',
          token: null
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'login',
        text: `Ошибка: ${err}`,
        messageType: 'error',
        token: null
      }
      return message
    }
  },

  async getAllUsers () {
    try {
      const users = await getUsers()
      const employeeIds = users.reduce((acc, item) => [...acc, item.employeeId], [])
      const employees = await formEmployees(employeeIds)
      const output = users.map(el => formUser(el, employees))
      return output
    } catch (err) {
      throw err
    }
  },

  async getUser (root, { id }) {
    try {
      const user = await getUsers(id)
      const employees = await formEmployees([user.employeeId])
      return formUser(user, employees)
    } catch (err) {
      throw err
    }
  },

  async deleteUser (root, { id }) {
    try {
      const candidate = await Auth.User.findByPk(id)
      if (candidate.avatar) {
        await deleteAvatar(candidate.avatar)
      }
      candidate.destroy()
      const message = {
        type: 'deleteUser',
        text: 'Пользователь успешно удалён',
        messageType: 'success',
        id
      }
      pubsub.publish('USER_CHANGED', {
        userChanged: {
          type: 'delete',
          id
        }
      })
      return message
    } catch (err) {
      const message = {
        type: 'deleteUser',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async addGroup (root, { group: { name, permissions } }) {
    try {
      const iName = _.trim(_.replace(name, /[\[\]&{}<>#$%^*!@+\/\\`~]+/g, ''))
      const candidate = await Auth.Group.findOne({ where: { name: iName } })
      if (candidate) {
        const message = {
          type: 'addGroup',
          text: 'Группа с таким названием уже существует',
          messageType: 'error'
        }
        return message
      } else {
        const newItem = await Auth.Group.create({
          name: iName,
          permissions: +permissions
        })
        const message = {
          type: 'addGroup',
          text: 'Группа успешно добавлена',
          messageType: 'success',
          id: newItem.id,
          item: JSON.stringify({ group: { name, permissions } })
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'addGroup',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async editGroup (root, { id, group: { name, permissions } }) {
    try {
      const iName = _.trim(_.replace(name, /[\[\]&{}<>#$%^*!@+\/\\`~]+/g, ''))
      const candidate = await Auth.Group.findByPk(id)
      if (!candidate) {
        const message = {
          type: 'editGroup',
          text: 'Группы с таким id не существует',
          messageType: 'error'
        }
        return message
      } else {
        candidate.name = iName
        candidate.permissions = +permissions
        await candidate.save()
        const message = {
          type: 'editGroup',
          text: 'Группа успешно изменена',
          messageType: 'success',
          id,
          item: JSON.stringify({ group: { name, permissions } })
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'editGroup',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async deleteGroup (root, { id }) {
    try {
      const candidate = await Auth.Group.findByPk(id)
      candidate.destroy()
      const message = {
        type: 'deleteGroup',
        text: 'Группа успешно удалена',
        messageType: 'success',
        id
      }
      return message
    } catch (err) {
      const message = {
        type: 'deleteGroup',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async assignUsersToGroup (root, { userId, groupId }) {
    try {
      const group = await Auth.Group.findByPk(groupId)
      if (!group) {
        const message = {
          type: 'assignUsersToGroup',
          text: 'Группы с таким id не существует',
          messageType: 'error'
        }
        return message
      } else {
        const users = []
        for (let i = 0; i < userId.length; i++) {
          const user = await Auth.User.findByPk(userId[i])
          if (!user) {
            const message = {
              type: 'assignUsersToGroup',
              text: `Пользователя с id = ${userId[i]} не существует`,
              messageType: 'error'
            }
            return message
          }
          users.push(user)
        }
        await group.setUsers(users)
        const message = {
          type: 'assignUsersToGroup',
          text: 'Пользователи успешно добавлены в группу',
          messageType: 'success',
          id: userId.join(',')
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'assignUsersToGroup',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async assignUserToGroups (root, { userId, groupId }) {
    try {
      const user = await Auth.User.findByPk(userId)
      if (!user) {
        const message = {
          type: 'assignUserToGroups',
          text: 'Пользователя с таким id не существует',
          messageType: 'error'
        }
        return message
      } else {
        const groups = []
        for (let i = 0; i < groupId.length; i++) {
          const group = await Auth.Group.findByPk(groupId[i])
          if (!user) {
            const message = {
              type: 'assignUserToGroups',
              text: `Группы с id = ${groupId[i]} не существует`,
              messageType: 'error'
            }
            return message
          }
          groups.push(group)
        }
        await user.setGroups(groups)
        const message = {
          type: 'assignUserToGroups',
          text: 'Пользователь успешно добавлен в группы',
          messageType: 'success',
          id: userId
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'assignUserToGroups',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async removeUsersFromGroup (root, { userId, groupId }) {
    try {
      const group = await Auth.Group.findByPk(groupId)
      if (!group) {
        const message = {
          type: 'removeUsersFromGroup',
          text: 'Группы с таким id не существует',
          messageType: 'error'
        }
        return message
      } else {
        const users = []
        for (let i = 0; i < userId.length; i++) {
          const user = await Auth.User.findByPk(userId[i])
          if (!user) {
            const message = {
              type: 'removeUsersFromGroup',
              text: `Пользователя с id = ${userId[i]} не существует`,
              messageType: 'error'
            }
            return message
          }
          users.push(user)
        }
        await group.removeUsers(users)
        const message = {
          type: 'removeUsersFromGroup',
          text: 'Пользователи успешно исключены из группы',
          messageType: 'success',
          id: userId.join(',')
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'removeUsersFromGroup',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async removeUserFromAllGroups (root, { id }) {
    try {
      const user = await Auth.User.findByPk(id)
      if (!user) {
        const message = {
          type: 'removeUserFromAllGroups',
          text: 'Пользователя с таким id не существует',
          messageType: 'error'
        }
        return message
      } else {
        const userGroups = await user.getGroups()
        await user.removeGroups(userGroups)
        const message = {
          type: 'removeUserFromAllGroups',
          text: 'Пользователь успешно исключён из всех групп',
          messageType: 'success',
          id
        }
        return message
      }
    } catch (err) {
      const message = {
        type: 'removeUserFromAllGroups',
        text: `Ошибка: ${err}`,
        messageType: 'error'
      }
      return message
    }
  },

  async getAllGroups () {
    try {
      return await Auth.Group.findAll()
    } catch (err) {
      throw err
    }
  },

  async getGroup (root, { id }) {
    try {
      return await Auth.Group.findByPk(id)
    } catch (err) {
      throw err
    }
  },

  async getUserGroups (root, { id }) {
    try {
      const user = await Auth.User.findByPk(id)
      return await user.getGroups()
    } catch (err) {
      throw err
    }
  },

  async getUsersOfGroup (root, { id }) {
    try {
      const group = await Auth.Group.findByPk(id)
      return await group.getUsers()
    } catch (err) {
      throw err
    }
  },

  async userCheckPermission (root, { id, permission }) {
    try {
      const user = await Auth.User.findByPk(id)
      if (!user) {
        return undefined
      }
      let userPermission = 0
      const groups = await this.getUserGroups({ id })
      for (const group of groups) {
        userPermission = userPermission | group.permissions
      }
      const userPermissionStr = userPermission.toString(2)
      const permissionStr = permission.toString(2)
      let result = true
      for (let i = 0; i < 32; i++) {
        const item1 = permissionStr[permissionStr.length - i] ? permissionStr[permissionStr.length - i] : '0'
        const item2 = userPermissionStr[userPermissionStr.length - i] ? userPermissionStr[userPermissionStr.length - i] : '0'
        if (item1 > item2) {
          result = false
        }
      }
      return result
    } catch (err) {
      throw err
    }
  },
  async deleteUploadedFiles (root, { files }) {
    try {
      const message = {
        type: 'deleteUploadedFiles',
        text: 'Все файлы успешно удалены',
        messageType: 'success'
      }
      for (const file of files) {
        const mes = await deleteAvatarUpoad(file)
        if (mes.messageType === 'error') {
          message.messageType = mes.messageType
          message.text = mes.text
        }
      }
      return message
    } catch (err) {
      throw err
    }
  }
}
