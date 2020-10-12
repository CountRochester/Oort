import { getFormatedDate } from '@/utils/date'
import { removeDublicates, removeDublicatesSimple } from '@/utils/array'

export default {
  formUpdatedArray (rootGetters, entititys, entField, id, functionName) {
  // rootState.docs.currentPositions --- entititys
  // Обновление всех зависящих должностей
    const entititysNeedToUpdate = entititys.filter(el => el[entField] === id)
    const updatedEntititys = []
    const updatedIds = []
    entititysNeedToUpdate.forEach((el) => {
      updatedEntititys.push(this[functionName](rootGetters, el.id))
      updatedIds.push(el.id)
    })
    const entititysDontNeedUpdate = entititys.filter(el => !updatedIds.includes(el.id))
    return [...updatedEntititys, ...entititysDontNeedUpdate]
  },

  formUpdatedArrayComplex (rootGetters, entititys, entField, id, functionName, state) {
  // rootState.docs.currentPositions --- entititys
  // Обновление всех зависящих должностей
    const entititysNeedToUpdate = entititys.filter(el => el[entField].includes(id))
    const updatedEntititys = []
    const updatedIds = []
    entititysNeedToUpdate.forEach((el) => {
      updatedEntititys.push(this[functionName](state, rootGetters, el.id))
      updatedIds.push(el.id)
    })
    const entititysDontNeedUpdate = entititys.filter(el => !updatedIds.includes(el.id))
    return [...updatedEntititys, ...entititysDontNeedUpdate]
  },

  formUpdatedArrayCurPosSubdiv (rootGetters, entititys, entField, id) {
  // rootState.docs.currentPositions --- entititys
  // Обновление всех зависящих должностей
    const entititysNeedToUpdate = entititys.filter(el => el[entField].includes(id))
    const updatedEntititys = []
    const updatedIds = []
    entititysNeedToUpdate.forEach((el) => {
      updatedEntititys.push(this.getUpdatedCurrentPosition(rootGetters, el.id))
      updatedIds.push(el.id)
    })
    const entititysDontNeedUpdate = entititys.filter(el => !updatedIds.includes(el.id))
    return [...updatedEntititys, ...entititysDontNeedUpdate]
  },

  update (collection, id, field) {
    if (Object.prototype.toString.call(id) === '[object Array]') {
      const arr = []
      id.forEach((el) => {
        const ent = collection[el]
        if (ent) {
          arr.push(ent[field])
        }
      })
      return arr.length ? arr : undefined
    } else {
      const ent = collection[id]
      if (ent) {
        return ent[field]
      }
    }
  },

  addOrEditNewItems ({ commit, state }, items, entitity, idNames, collection) {
    const itemsToAdd = []
    const itemsIdsToAdd = []
    let itemsToUpdate
    if (Object.prototype.toString.call(idNames) === '[object Array]') {
      itemsToUpdate = {}
      items.forEach((item) => {
        if (collection[item[idNames]]) {
          itemsToAdd.push(item)
          itemsIdsToAdd.push(item)
          idNames.forEach((name) => {
            itemsToUpdate[name].push(item[name])
          })
        }
      })
    } else {
      itemsToUpdate = []
      items.forEach((item) => {
        if (collection[item[idNames]]) {
          itemsToAdd.push(item)
          itemsIdsToAdd.push(item)
          itemsToUpdate.push(item[idNames])
        }
      })
    }
    if (itemsToAdd.length) {
      const arrDoNotNeedToUpdate = state[entitity].filter(el => !itemsIdsToAdd.includes(el.id))
      const newArray = [...arrDoNotNeedToUpdate, ...itemsToAdd]
      commit('set', [entitity, removeDublicates(newArray)])
      return itemsToUpdate
    }
  },

  addOrEditNewItemsSimple ({ commit, state }, items, entitity, callback) {
    const itemsIdsToAdd = items.reduce((acc, curVal, index) => { acc[index] = curVal.id; return acc }, [])
    if (items.length) {
      const arrDoNotNeedToUpdate = state[entitity].filter(el => !itemsIdsToAdd.includes(el.id))
      const newArray = [...arrDoNotNeedToUpdate, ...items]
      if (callback) {
        callback(newArray)
      }
      commit('set', [entitity, removeDublicates(newArray)])
      return itemsIdsToAdd
    }
  },

  deleteItems ({ commit, state }, ids, entitity, idName, collection) {
    const itemsToDelete = []
    const itemsToUpdate = []
    ids.forEach((id) => {
      const item = collection[id]
      if (item) {
        itemsToDelete.push(item)
        itemsToUpdate.push(item[idName])
      }
    })
    if (itemsToDelete.length) {
      const newArray = state[entitity].filter(el => !ids.includes(el.id))
      commit('set', [entitity, removeDublicates(newArray)])
      if (itemsToUpdate.length) {
        return itemsToUpdate
      }
    }
  },

  deleteItemsSimple ({ commit, state }, ids, entitity) {
    if (ids.length) {
      const newArray = state[entitity].filter(el => !ids.includes(el.id))
      commit('set', [entitity, removeDublicates(newArray)])
    }
  },

  findMultipleRows (arr, rows, whatToFind, findRow = 'id') {
    // arr - массив с объектами где ищем поля
    // rows - массив полей
    // whatToFind - массив значений, которые могут быть в полях
    // findRow - поле объекта которое будет добавляться в выходной массив
    const output = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      rows.forEach((row) => {
        if (Object.prototype.toString.call(item[row]) === '[object Array]') {
          item[row].some((el) => {
            if (whatToFind.includes(el)) {
              output.push(item[findRow])
              return true
            }
          })
        } else if (whatToFind.includes(item[row])) {
          output.push(item[findRow])
        }
      })
    }
    return removeDublicatesSimple(output)
  },

  // ----------------------------------------------------------------------------------------------------------------
  getArrayAndIds (ids, searchArray) {
    const output = {
      items: [],
      ids: []
    }
    ids.forEach((el) => {
      const item = searchArray[el]
      if (item) {
        output.items.push(item)
        output.ids.push(item.ExtEmployeeId)
      }
    })
    return output
  },
  // ----------------------------------------------------------------------------------------------------------------
  formEmployee (rootGetters, item) {
    const subdivisions = []
    const depsId = []
    const positions = []
    const curPos = []
    item.SubdivisionsId = item.SubdivisionsId || item.Subdivisions
    if (item.SubdivisionsId.length) {
      for (const subDivId of item.SubdivisionsId) {
        const subD = rootGetters['docs/getSubdivisionById'][subDivId]
        if (subD) {
          subdivisions.push(subD.name)
        }
      }
    }
    item.name = item.secondName + ' ' + item.firstName[0] + '.' + item.middleName[0] + '.'
    item.nameFull = item.secondName + ' ' + item.firstName + ' ' + item.middleName
    item.PositionsId = item.PositionsId || item.Positions
    item.Subdivisions = subdivisions.join('\n')
    item.PositionsId.forEach((el) => {
      const cPosition = rootGetters['docs/getCurrentPositionById'][el]
      curPos.push(cPosition)
      depsId.push(cPosition.DepartmentId)
      positions.push(cPosition.Position + ' (' + cPosition.Department + ')')
    })
    item.Positions = positions.join(' \n')
    item.DepartmentsId = depsId
    item.currentPositions = { ...curPos }
  },

  formState (states) {
    const updatedItems = []
    for (let index = 0; index < states.length; index++) {
      const item = states[index]
      const nextState = states.find(elem => elem.parentStateId === item.id)
      const prevState = item.parentStateId ? states.find(elem => elem.id === item.parentStateId).name : ''
      if (item.prevState !== prevState || item.nextState !== nextState) {
        updatedItems.push(item.id)
        item.prevState = prevState
        item.nextState = nextState ? nextState.name : ''
      }
    }
    return updatedItems
  },

  formDep (deps, item) {
    const cDepsId = []
    const cDepsNames = []
    for (let i = 0; i < deps.length; i++) {
      if (deps[i].parentDepartmentId === item.id) {
        cDepsId.push(deps[i].id)
        cDepsNames.push(deps[i].shortName)
      }
    }
    item.parentDepartment = item.parentDepartmentId ? deps.find(elem => elem.id === item.parentDepartmentId).shortName : null
    item.childDepsId = cDepsId
    item.childDeps = cDepsNames.join('; ')
  },

  formContract (item) {
    item.numberDate = `№${item.number} от ${item.date}`
  },

  formTema (rootGetters, item) {
    const currentContract = rootGetters['docs/getContractById'][item.ContractId]
    item.contract = `от ${currentContract.date} №${currentContract.number}`
  },

  formCurrentPosition (rootGetters, employees, item) {
    const emp = employees[item.EmployeeId]
    const dep = rootGetters['auth/getDepById'][item.DepartmentId]
    const pos = rootGetters['docs/getPositionById'][item.PositionId]
    const subdiv = []
    item.SubdivisionId.forEach((el) => {
      const subd = rootGetters['docs/getSubdivisionById'][el]
      if (subd) {
        subdiv.push(subd.name)
      }
    })
    const nameDat = emp
      ? (emp.secondNameDat || emp.secondName) + ' ' + emp.firstName[0] + '.' + emp.middleName[0] + '.'
      : ''
    item.posName = `${emp ? emp.secondName : ''} ${emp ? emp.firstName[0] : ''}.${emp ? emp.middleName[0] : ''}. ${pos ? pos.posName : ''} (${dep ? dep.shortName : ''})`
    item.startDate = getFormatedDate(item.startDate)
    item.endDate = getFormatedDate(item.endDate)
    item.Employee = emp ? emp.name : ''
    item.EmployeeDat = nameDat
    item.Position = pos ? pos.posName : ''
    item.Department = dep ? dep.shortName : ''
    item.Subdivision = subdiv.length ? subdiv.join(', ') : item.Subdivision
  },

  formExtCurrentPosition (rootGetters, extEmployees, item) {
    const emp = extEmployees.find(el => el.id === item.ExtEmployeeId)
    const pos = rootGetters['docs/getPositionById'][item.PositionId]
    const org = rootGetters['docs/getOrganisationById'][item.OrganisationId]
    const nameDat = emp
      ? (emp.secondNameDat || emp.secondName) + ' ' + emp.firstName[0] + '.' + emp.middleName[0] + '.'
      : ''
    item.posName = `${emp ? emp.secondName : ''} ${emp ? emp.firstName[0] : ''}.${emp ? emp.middleName[0] : ''}. ${pos
      ? pos.posName : item.Position} (${org ? org.orgName : item.Organisation})`
    item.startDate = getFormatedDate(item.startDate)
    item.endDate = getFormatedDate(item.endDate)
    item.ExtEmployee = emp ? `${emp ? emp.secondName : ''} ${emp ? emp.firstName[0] : ''}.${emp ? emp.middleName[0] : ''}.` : ''
    item.ExtEmployeeDat = nameDat
  },

  formExtEmployee (state, rootGetters, item) {
    const extCurPos = []
    const organisationId = []
    const organisation = []
    const positionId = []
    const position = []
    // console.log(state.extCurrentPositions)
    state.extCurrentPositions.forEach((el) => {
      if (el.ExtEmployeeId === item.id) {
        extCurPos.push(el)
      }
    })
    extCurPos.forEach((el) => {
      const pos = rootGetters['docs/getPositionById'][el.PositionId]
      const org = rootGetters['docs/getOrganisationById'][el.OrganisationId]
      organisationId.push(el.OrganisationId)
      organisation.push(org.orgName)
      positionId.push(el.PositionId)
      position.push(pos.posName)
    })
    item.extCurrentPositions = extCurPos
    item.organisation = organisation
    item.organisationId = organisationId
    item.position = position
    item.positionId = positionId
    item.name = `${item.secondName || ''} ${item.firstName[0] || ''}. ${item.middleName[0] || ''}.`
    item.nameFull = `${item.secondName || ''} ${item.firstName || ''} ${item.middleName || ''}`
  },

  formResolution (item) {
    let color = 'green'
    let darkText = true
    if (item.expirationDate) {
      const d = item.expirationDate.split('.')
      const date = new Date(d[2], d[1] - 1, d[0])
      const dd = date - Date.now()
      if (dd > (86400000 * 3)) {
        color = 'green'
      } else if (dd <= (86400000 * 3) && dd > 0) {
        color = 'yellow lighten-1'
        darkText = false
      } else {
        color = 'red'
      }
    }
    item.color = color
    item.darkText = darkText
  },

  formSubdivision (rootGetters, item) {
    const dep = rootGetters['auth/getDepById'][item.DepartmentId]
    item.Department = dep ? dep.shortName : ''
  },

  // ---------------------------------------------------------------------------------------------------------------------

  getUpdatedEmployee (state, rootGetters, id) {
    const employee = state.employees.find(el => el.id === id)
    if (employee) {
      const updatedEmployee = { ...employee }
      this.formEmployee(rootGetters, updatedEmployee)
      return updatedEmployee
    }
  },

  getUpdatedCurrentPosition (rootGetters, id) {
    const curPos = rootGetters['docs/getCurrentPositionById'][id]
    if (curPos) {
      const employees = rootGetters['auth/getEmployeeById']
      const updatedCurrentPosition = { ...curPos }
      this.formCurrentPosition(rootGetters, updatedCurrentPosition, employees)
      return updatedCurrentPosition
    }
  },

  getUpdatedExtCurrentPosition (rootGetters, id) {
    const extCurPos = rootGetters['docs/getExtCurrentPositionById'][id]
    if (extCurPos) {
      const extEmployees = rootGetters['docs/getExtEmployees']
      const updatedExtCurrentPosition = { ...extCurPos }
      this.formExtCurrentPosition(rootGetters, updatedExtCurrentPosition, extEmployees)
      return updatedExtCurrentPosition
    }
  },

  getUpdatedSubdivision (rootGetters, id) {
    const subdiv = rootGetters['docs/getSubdivisionById'][id]
    if (subdiv) {
      const updatedSubdiv = { ...subdiv }
      this.formSubdivision(rootGetters, updatedSubdiv)
      return updatedSubdiv
    }
  },

  getUpdatedTema (rootGetters, id) {
    const tema = rootGetters['docs/getTemasById'][id]
    if (tema) {
      const updatedTema = { ...tema }
      this.formSubdivision(rootGetters, updatedTema)
      return updatedTema
    }
  }
}
