// -- Из базы:
//  id
//  depName
//  depNumber
//  shortName
//  depPrefix
//  parentDepartmentId
//  updatedAt
//
// -- Ссылки:
//  ParentDepartment
//  ChildDeps
//  Subdivisions
//
// -- Вычисляемые:
//  parentDepartment
//  childDeps
//  childDepsId
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Departments --------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullDepartment extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.depName = ''
    this.depNumber = ''
    this.shortName = ''
    this.depPrefix = ''
    this.parentDepartmentId = -1
    this.updatedAt = ''
  }

  get ParentDepartment () {
    return new NullDepartment()
  }

  get ChildDeps () {
    return []
  }

  get Subdivisions () {
    return []
  }

  get parentDepartment () {
    return this.ParentDepartment.shortName
  }

  get childDeps () {
    return []
  }

  get childDepsId () {
    return []
  }

  toJSON () {
    return {
      id: this.id,
      depName: this.depName,
      depNumber: this.depNumber,
      shortName: this.shortName,
      depPrefix: this.depPrefix,
      parentDepartmentId: this.parentDepartmentId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullDepartment()
  }
}

export class Department extends NullDepartment {
  constructor ({
    id = '',
    depName = '',
    depNumber = '',
    shortName = '',
    depPrefix = '',
    parentDepartmentId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.depName = depName
    this.depNumber = depNumber
    this.shortName = shortName
    this.depPrefix = depPrefix
    this.parentDepartmentId = parentDepartmentId
    this.updatedAt = updatedAt
  }

  get ParentDepartment () {
    if (this.parentDepartmentId) {
      return this.docs.buffer.departments.indexed[this.parentDepartmentId]
    } else { return new NullDepartment() }
  }

  get ChildDeps () {
    const arr = []
    this.docs.buffer.departments.items.forEach((el) => {
      if (el.parentDepartmentId === this.id) {
        arr.push(el)
      }
    })
    return arr
  }

  get Subdivisions () {
    const arr = []
    this.docs.buffer.subdivisions.items.forEach((el) => {
      if (el.DepartmentId === this.id) {
        arr.push(el)
      }
    })
    return arr
  }

  get childDeps () {
    if (this.ChildDeps.length) {
      const arr = []
      this.ChildDeps.forEach((el) => {
        arr.push(el.shortName)
      })
      return arr
    } else { return [] }
  }

  get childDepsId () {
    if (this.ChildDeps.length) {
      const arr = []
      this.ChildDeps.forEach((el) => {
        arr.push(el.id)
      })
      return arr
    } else { return [] }
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Department(obj)
  }
}

export function formDepartments (element) {
  return new Department(element)
}

export async function addDepartment (instance, item) {
  await common.addItem(instance, 'departments', item)
}

export async function editDepartment (instance, item) {
  await common.editItem(instance, 'departments', item)
}

export async function editDepartments (instance, item) {
  await common.edit(instance, 'departments', item)
}

async function updateRelEntitys (storage, entity, id) {
  const length = storage[entity].items.length
  if (!length) { return }
  for (let i = 0; i < length; i++) {
    const el = storage[entity].items[i]
    if (el.DepartmentId === id) {
      el.DepartmentId = null
      await storage[entity].edit(el.id, el)
    }
  }
}
async function updateChildDeps (storage, id) {
  const dep = storage.departments.indexed[id]
  for (const childDep of dep.ChildDeps) {
    childDep.parentDepartmentId = null
    await storage.departments.edit(childDep.id, childDep)
  }
}

async function deleteRelEntitys (storage, entity, id) {
  const itemsToDelete = []
  const length = storage[entity].items.length
  if (!length) { return }
  for (let i = 0; i < length; i++) {
    const el = storage[entity].items[i]
    if (el.DepartmentId === id) {
      itemsToDelete.push(el.id)
    }
  }
  if (itemsToDelete.length) {
    await storage[entity].deleteItem(itemsToDelete)
  }
}

export async function deleteDepartments (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      deleteRelEntitys(storage, 'extIncStates', id),
      deleteRelEntitys(storage, 'intIncStates', id),
      deleteRelEntitys(storage, 'internalIncStates', id),
      deleteRelEntitys(storage, 'incNumbers', id),
      deleteRelEntitys(storage, 'intIncNumbers', id),
      deleteRelEntitys(storage, 'internalIncNumbers', id),
      deleteRelEntitys(storage, 'subdivisions', id),
      updateRelEntitys(storage, 'currentPositions', id),
      updateChildDeps(storage, id)
    ])
  }
  storage.departments.delete(itemsId)
}
