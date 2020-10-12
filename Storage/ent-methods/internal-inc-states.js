// ----------- Поля InternalIncStates
// --Из базы:
//
//  id
//  InternalId
//  DepartmentId
//  StateId
//
// --Вычисляемые:
//
//
// --Ссылки:
//
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- InternalIncStates ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullInternalIncState extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.IntId = -1
    this.DepartmentId = -1
    this.StateId = -1
  }

  toJSON () {
    return {
      id: this.id,
      InternalId: this.IntId,
      DepartmentId: this.DepartmentId,
      StateId: this.StateId
    }
  }

  clone () {
    return new NullInternalIncState()
  }
}

export class InternalIncState extends NullInternalIncState {
  constructor ({
    id = '',
    InternalId = '',
    DepartmentId = '',
    StateId = ''
  } = {}) {
    super()
    this.id = id
    this.IntId = InternalId
    this.DepartmentId = DepartmentId
    this.StateId = StateId
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new InternalIncState(obj)
  }
}

export function formInternalIncStates (element) {
  return new InternalIncState(element)
}

export async function addInternalIncState (instance, item) {
  await common.addItem(instance, 'internalIncStates', item)
}

export async function editInternalIncState (instance, item) {
  await common.editItem(instance, 'internalIncStates', item)
}

export async function editInternalIncStates (instance, item) {
  await common.edit(instance, 'internalIncStates', item)
}

async function updateDocIncStates (storage, id) {
  const incNum = storage.internalIncStates.indexed[id]
  if (!incNum.isValid) { return }
  const doc = storage.internals.indexed[incNum.IntIncomingId]
  if (!doc.isValid) { return }
  for (const depData of doc.InternalDepData) {
    if (depData.state && depData.state.InternalStateId === id) {
      if (depData.incNumber) {
        delete depData.state
      } else {
        doc.InternalDepData = doc.InternalDepData.filter(el => el.state.InternalStateId !== id)
      }
    }
  }
  const docToSave = doc.toJSON()
  await storage.internals.edit(docToSave.id, docToSave)
}

export async function deleteInternalIncStates (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDocIncStates(storage, id)
  }
  if (itemsId.length) {
    storage.internalIncStates.delete(itemsId)
  }
}
