// -- Из базы:
//  id
//  name
//  fullName
//  DepartmentId
//  updatedAt
//
// -- Ссылки
//  Department
//
// -- Вычисляемые
//  department

// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Subdivisions ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import { NullDepartment } from '@/Storage/ent-methods/departments'
import * as common from './common'

export class NullSubdivision extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.name = ''
    this.fullName = ''
    this.DepartmentId = -1
    this.updatedAt = ''
  }

  get Department () {
    return new NullDepartment()
  }

  get department () {
    return this.Department.shortName
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      fullName: this.fullName,
      DepartmentId: this.DepartmentId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullSubdivision()
  }
}

export class Subdivision extends NullSubdivision {
  constructor ({
    id = '',
    name = '',
    fullName = '',
    DepartmentId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.name = name
    this.fullName = fullName
    this.DepartmentId = DepartmentId
    this.updatedAt = updatedAt
  }

  get Department () {
    if (this.DepartmentId && this.docs.buffer.departments.indexed.length) {
      return this.docs.buffer.departments.indexed[this.DepartmentId]
    } else { return new NullDepartment() }
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Subdivision(obj)
  }
}

export function formSubdivisions (element) {
  return new Subdivision(element)
}

export async function addSubdivision (instance, item) {
  await common.addItem(instance, 'subdivisions', item)
}

export async function editSubdivision (instance, item) {
  await common.editItem(instance, 'subdivisions', item)
}

export async function editSubdivisions (instance, item) {
  await common.edit(instance, 'subdivisions', item)
}

async function updateCurrentPositions (storage, id) {
  for (let i = 0; i < storage.currentPositions.items.length; i++) {
    const el = storage.currentPositions.items[i]
    if (el.SubdivisionId.includes(id)) {
      el.SubdivisionId = el.SubdivisionId.filter(it => it !== id)
      const curPosToSave = el.toJSON()
      await storage.currentPositions.edit(curPosToSave.id, curPosToSave)
    }
  }
}

async function updateEmployees (storage, id) {
  for (let i = 0; i < storage.employees.items.length; i++) {
    const el = storage.employees.items[i]
    if (el.subdivisionsId.includes(id)) {
      el.subdivisionsId = el.subdivisionsId.filter(it => it !== id)
      const empToSave = el.toJSON()
      await storage.employees.edit(empToSave.id, empToSave)
    }
  }
}

export async function deleteSubdivisions (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      updateCurrentPositions(storage, id),
      updateEmployees(storage, id)
    ])
  }
  storage.subdivisions.delete(itemsId)
}
