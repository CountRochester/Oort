const Sequelize = require('sequelize')
const dbAuth = require('../../db/auth')
// ----------------------------------------------------------------------------------
// Подключение моделей
const User = require('./auth-parts/user')
const Group = require('./auth-parts/group')
const session = require('./auth-parts/session')

// ----------------------------------------------------------------------------------
// Подключение вспомогательных моделей
const userGroup = require('./auth-parts/service/user-group')

// ----------------------------------------------------------------------------------
// Регистрация связей моделей
// Пользователь может принадлежать к нескольким группам
User.belongsToMany(Group, { through: userGroup })
// Вкаждой группе может находиться несколько пользователей
Group.belongsToMany(User, { through: userGroup })

// У пользователя может быть одна сессия
User.hasOne(session)
// Каждая сессия принадлежит пользователю
session.belongsTo(User)

// ----------------------------------------------------------------------------------
module.exports = {
  dbAuth,
  Sequelize,
  User,
  Group,
  session
}
