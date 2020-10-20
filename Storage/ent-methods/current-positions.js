'use strict'

import { getFormatedDate } from '@/utils/date'

// -- Из базы:
//  id
//  startDate
//  endDate
//  EmployeeId
//  PositionId
//  DepartmentId
//  SubdivisionId
//  extPrefix
//  intPrefix
//  updatedAt
//
// -- Ссылки:
//  Employee
//  Position
//  Department
//  Subdivisions
//
// -- Вычисляемые:
//  posName
//  employee
//  employeeDat
//  position
//  department
//  subdivisions

// ------------------------------------------------------------------------------------------------------
// ---------------------------------- CurrentPositions --------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import { NullDepartment } from '@/Storage/ent-methods/departments'
import { NullEmployee } from '@/Storage/ent-methods/employees'
import { NullPosition } from '@/Storage/ent-methods/positions'
import * as common from './common'

export class NullCurrentPosition extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.EmployeeId = -1
    this.PositionId = -1
    this.DepartmentId = -1
    this.SubdivisionId = []
    this.extPrefix = ''
    this.intPrefix = ''
    this.updatedAt = new Date().toISOString().substr(0, 10)
    this.startDate = ''
    this.endDate = ''
  }

  get Employee () {
    return new NullEmployee()
  }

  get Position () {
    return new NullPosition()
  }

  get Department () {
    return new NullDepartment()
  }

  get Subdivisions () {
    return []
  }

  get posName () {
    return ''
  }

  get employee () {
    const firstName = this.Employee.firstName ? this.Employee.firstName[0] : ''
    const middleName = this.Employee.middleName ? this.Employee.middleName[0] : ''
    return this.Employee.isValid
      ? `${this.Employee.secondName || ''} ${firstName}.${middleName}.`
      : 'Работник не найден'
  }

  get employeeDat () {
    const firstName = this.Employee.firstName ? this.Employee.firstName[0] : ''
    const middleName = this.Employee.middleName ? this.Employee.middleName[0] : ''
    return this.Employee.isValid
      ? `${this.Employee.secondNameDat || this.Employee.secondName || ''} ${firstName}.${middleName}.`
      : 'Работник не найден'
  }

  get position () {
    return this.Position.isValid
      ? this.Position.posName
      : 'Должность не найдена'
  }

  get department () {
    return this.Department.isValid
      ? this.Department.shortName
      : 'Отдел не найден'
  }

  get subdivisions () {
    return []
  }

  toJSON () {
    return {
      id: this.id,
      startDate: this.startDate,
      endDate: this.endDate,
      EmployeeId: this.EmployeeId,
      PositionId: this.PositionId,
      DepartmentId: this.DepartmentId,
      SubdivisionId: this.SubdivisionId,
      extPrefix: this.extPrefix,
      intPrefix: this.intPrefix,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullCurrentPosition()
  }
}

export class CurrentPosition extends NullCurrentPosition {
  constructor ({
    id = '',
    EmployeeId = '',
    PositionId = '',
    DepartmentId = '',
    SubdivisionId = [],
    extPrefix = '',
    intPrefix = '',
    startDate = '',
    endDate = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.EmployeeId = EmployeeId
    this.PositionId = PositionId
    this.DepartmentId = DepartmentId
    this.SubdivisionId = SubdivisionId || []
    this.extPrefix = extPrefix || ''
    this.intPrefix = intPrefix || ''
    this.updatedAt = updatedAt
    this.startDate = getFormatedDate(startDate)
    this.endDate = getFormatedDate(endDate)
  }

  get Employee () {
    return this.docs.buffer.employees.indexed[this.EmployeeId]
  }

  get Position () {
    return this.docs.buffer.positions.indexed[this.PositionId]
  }

  get Department () {
    return this.docs.buffer.departments.indexed[this.DepartmentId]
  }

  get Subdivisions () {
    const subdiv = []
    if (this.SubdivisionId) {
      this.SubdivisionId.forEach((el) => {
        const subd = this.docs.buffer.subdivisions.indexed[el]
        if (subd.isValid) {
          subdiv.push(subd)
        }
      })
    }
    return subdiv
  }

  get posName () {
    const firstName = this.Employee.firstName ? this.Employee.firstName[0] : ''
    const middleName = this.Employee.middleName ? this.Employee.middleName[0] : ''
    return this.Employee.isValid
      ? this.Position.isValid
        ? this.Department.isValid
          ? `${this.Employee?.secondName || ''} ${firstName}.${middleName}. ${this.Position?.posName || ''} (${this.Department?.shortName || ''})`
          : 'Отдел не найден'
        : 'Должность не найдена'
      : 'Работник не найден'
  }

  get subdivisions () {
    const output = []
    this.Subdivisions.forEach((el) => {
      output.push(el.name)
    })
    return this.Subdivisions
      ? output.join(', ') || ''
      : ''
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new CurrentPosition(obj)
  }
}

export function formCurrentPositions (element) {
  return new CurrentPosition(element)
}

export async function addCurrentPosition (instance, items) {
  const storage = await common.getStorage(instance)
  for (const item of items) {
    await common.addItem(instance, 'currentPositions', item)
    await updateEmployeeByAddCurPos(storage, item.id)
  }
}

export async function editCurrentPosition (instance, items) {
  const storage = await common.getStorage(instance)
  for (const item of items) {
    await common.editItem(instance, 'currentPositions', item)
    await updateEmployeeByAddCurPos(storage, item.id)
  }
}

export async function editCurrentPositions (instance, items) {
  const storage = await common.getStorage(instance)
  for (const item of items) {
    await common.edit(instance, 'currentPositions', item)
    await updateEmployeeByAddCurPos(storage, item.id)
  }
  // await editCurrentPosition(instance, items)
}

async function updateRelExtInc (storage, id) {
  for (let i = 0; i < storage.extIncomings.items.length; i++) {
    const el = storage.extIncomings.items[i]
    if (el.executantsId.includes(id)) {
      el.executantsId = el.executantsId.filter(it => it !== id)
      const docToSave = el.toJSON()
      await storage.extIncomings.edit(docToSave.id, docToSave)
    }
  }
}
async function updateRelExtOut (storage, id) {
  for (let i = 0; i < storage.extOutgoings.items.length; i++) {
    const el = storage.extOutgoings.items[i]
    let change = false
    if (el.authorId === id) {
      el.authorId = null
      change = true
    }
    if (el.podpisantsId.includes(id)) {
      el.podpisantsId = el.podpisantsId.filter(it => it !== id)
      change = true
    }
    if (change) {
      const docToSave = el.toJSON()
      await storage.extOutgoings.edit(docToSave.id, docToSave)
    }
  }
}
async function updateRelIntInc (storage, id) {
  for (let i = 0; i < storage.intIncomings.items.length; i++) {
    const el = storage.intIncomings.items[i]
    let change = false
    if (el.authorId === id) {
      el.authorId = null
      change = true
    }
    if (el.podpisantsId.includes(id)) {
      el.podpisantsId = el.podpisantsId.filter(it => it !== id)
      change = true
    }
    if (el.addresseesId.includes(id)) {
      el.addresseesId = el.addresseesId.filter(it => it !== id)
      change = true
    }
    if (change) {
      const docToSave = el.toJSON()
      await storage.intIncomings.edit(docToSave.id, docToSave)
    }
  }
}
async function updateRelIntOut (storage, id) {
  for (let i = 0; i < storage.intOutgoings.items.length; i++) {
    const el = storage.intOutgoings.items[i]
    let change = false
    if (el.authorId === id) {
      el.authorId = null
      change = true
    }
    if (el.podpisantsId.includes(id)) {
      el.podpisantsId = el.podpisantsId.filter(it => it !== id)
      change = true
    }
    if (el.addresseesId.includes(id)) {
      el.addresseesId = el.addresseesId.filter(it => it !== id)
      change = true
    }
    if (change) {
      const docToSave = el.toJSON()
      await storage.intOutgoings.edit(docToSave.id, docToSave)
    }
  }
}
async function updateRelInternals (storage, id) {
  for (let i = 0; i < storage.internals.items.length; i++) {
    const el = storage.internals.items[i]
    let change = false
    if (el.authorId === id) {
      el.authorId = null
      change = true
    }
    if (el.podpisantsId.includes(id)) {
      el.podpisantsId = el.podpisantsId.filter(it => it !== id)
      change = true
    }
    if (el.addresseesId.includes(id)) {
      el.addresseesId = el.addresseesId.filter(it => it !== id)
      change = true
    }
    if (change) {
      const docToSave = el.toJSON()
      await storage.internals.edit(docToSave.id, docToSave)
    }
  }
}
async function updateRelResolutions (storage, id) {
  for (let i = 0; i < storage.resolutions.items.length; i++) {
    const el = storage.resolutions.items[i]
    let change = false
    if (el.author === id) {
      el.author = null
      change = true
    }
    if (el.executants.includes(id)) {
      el.executants = el.executants.filter(it => it !== id)
      change = true
    }
    if (change) {
      await storage.resolutions.edit(el.id, el)
    }
  }
}
async function updateEmployees (storage, id) {
  for (let i = 0; i < storage.employees.items.length; i++) {
    const el = storage.employees.items[i]
    if (el.positionsId.includes(id)) {
      el.positionsId = el.positionsId.filter(it => it !== id)
      const empToSave = el.toJSON()
      await storage.employees.edit(empToSave.id, empToSave)
    }
  }
}

async function updateEmployeeByAddCurPos (storage, id) {
  const curPos = storage.currentPositions.indexed[id]
  if (curPos.isValid) {
    const employeeToUpdate = curPos.Employee
    if (!employeeToUpdate.positionsId.includes(id)) {
      employeeToUpdate.positionsId.push(id)
      const empToSave = employeeToUpdate.toJSON()
      await storage.employees.edit(empToSave.id, empToSave)
    }
  }
}

export async function deleteCurrentPositions (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      updateEmployees(storage, id),
      updateRelExtInc(storage, id),
      updateRelExtOut(storage, id),
      updateRelIntInc(storage, id),
      updateRelIntOut(storage, id),
      updateRelInternals(storage, id),
      updateRelResolutions(storage, id)
    ])
  }
  storage.currentPositions.delete(itemsId)
}
