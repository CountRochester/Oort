// -- Из базы:
//  id
//  firstName
//  middleName
//  secondName
//  secondNameDat
//  tabelNumber
//  phone1
//  phone2
//  phone3
//  email1
//  email2
//  updatedAt
//
//  subdivisionsId
//  positionsId
//
// -- Ссылки:
//  CurrentPositions
//  Subdivisions
//  Departments
//
// -- Вычисляемые:
//  currentPositions
//  subdivisions
//  departmentsId
//  name
//  nameFull
//
// ------------------------------------------------------------------------------------------------------
// ----------------------------------Employees-----------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullEmployee extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.firstName = ''
    this.middleName = ''
    this.secondName = ''
    this.secondNameDat = ''
    this.tabelNumber = ''
    this.phone1 = ''
    this.phone2 = ''
    this.phone3 = ''
    this.email1 = ''
    this.email2 = ''
    this.updatedAt = ''
    this.positionsId = []
  }

  get subdivisionsId () {
    return []
  }

  get CurrentPositions () {
    return []
  }

  get Subdivisions () {
    return []
  }

  get Departments () {
    return []
  }

  get currentPositions () {
    return []
  }

  get subdivisions () {
    return []
  }

  get departmentsId () {
    return []
  }

  get name () {
    return `${this.secondName || ''} ${this.firstName[0] || ''}.${this.middleName[0] || ''}.`
  }

  get nameFull () {
    return `${this.secondName || ''} ${this.firstName || ''} ${this.middleName || ''}`
  }

  toJSON () {
    return {
      id: this.id,
      firstName: this.firstName,
      middleName: this.middleName,
      secondName: this.secondName,
      secondNameDat: this.secondNameDat,
      tabelNumber: this.tabelNumber,
      phone1: this.phone1,
      phone2: this.phone2,
      phone3: this.phone3,
      email1: this.email1,
      email2: this.email2,
      Positions: this.positionsId,
      Subdivisions: this.subdivisionsId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullEmployee()
  }
}

export class Employee extends NullEmployee {
  constructor ({
    id = '',
    firstName = '',
    middleName = '',
    secondName = '',
    secondNameDat = '',
    tabelNumber = '',
    phone1 = '',
    phone2 = '',
    phone3 = '',
    email1 = '',
    email2 = '',
    updatedAt = new Date().toISOString().substr(0, 10),
    Positions = []
  } = {}) {
    super()
    this.id = id
    this.firstName = firstName
    this.middleName = middleName
    this.secondName = secondName
    this.secondNameDat = secondNameDat
    this.tabelNumber = tabelNumber
    this.phone1 = phone1
    this.phone2 = phone2
    this.phone3 = phone3
    this.email1 = email1
    this.email2 = email2
    this.updatedAt = updatedAt
    this.positionsId = Positions.length
      ? [...Positions]
      : []
  }

  get CurrentPositions () {
    const pos = []
    this.positionsId.forEach((el) => {
      pos.push(this.docs.buffer.currentPositions.indexed[el])
    })
    return pos
  }

  get subdivisionsId () {
    let subdivId = []
    this.CurrentPositions.forEach((el) => {
      subdivId = [...subdivId, ...el.SubdivisionId]
    })
    return subdivId
  }

  get Subdivisions () {
    const pos = []
    this.subdivisionsId.forEach((el) => {
      pos.push(this.docs.buffer.subdivisions.indexed[el])
    })
    return pos
  }

  get Departments () {
    const deps = []
    this.CurrentPositions.forEach((el) => {
      deps.push(el.Department)
    })
    return deps
  }

  get currentPositions () {
    const curPos = []
    this.CurrentPositions.forEach((el) => {
      curPos.push(`${el.position || ''} (${el.department || ''})`)
    })
    return curPos
  }

  get subdivisions () {
    const subd = []
    this.Subdivisions.forEach((el) => {
      subd.push(el.name)
    })
    return subd
  }

  get departmentsId () {
    const depIds = []
    this.Departments.forEach((el) => {
      depIds.push(el.id)
    })
    return depIds
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Employee(obj)
  }
}

export function formEmployees (element) {
  return new Employee(element)
}

export async function addEmployee (instance, item) {
  await common.addItem(instance, 'employees', item)
}

export async function editEmployee (instance, item) {
  console.log('editEmployee', item)
  // await common.editItem(instance, 'employees', item)
  const storage = await common.getStorage(instance)
  const editedItem = storage.employees.items.find(el => el.id === item.id)
  editedItem.firstName = item.firstName
  editedItem.middleName = item.middleName
  editedItem.secondName = item.secondName
  editedItem.secondNameDat = item.secondNameDat
  editedItem.tabelNumber = item.tabelNumber
  editedItem.phone1 = item.phone1
  editedItem.phone2 = item.phone2
  editedItem.phone3 = item.phone3
  editedItem.email1 = item.email1
  editedItem.email2 = item.email2
  editedItem.updatedAt = item.updatedAt
  editedItem.positionsId = item.Positions.length
    ? [...item.Positions]
    : []
}

export async function editEmployees (instance, item) {
  console.log('editEmployees', item)
  await common.edit(instance, 'employees', item)
}

async function deleteRelCurrentPositions (storage, id) {
  const itemsToDelete = []
  for (let i = 0; i < storage.currentPositions.items.length; i++) {
    const el = storage.currentPositions.items[i]
    if (el.EmployeeId === id) {
      itemsToDelete.push(el.id)
    }
  }
  await storage.currentPositions.deleteItem(itemsToDelete)
}

export async function deleteEmployees (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await deleteRelCurrentPositions(storage, id)
  }
  storage.employees.delete(itemsId)
}
