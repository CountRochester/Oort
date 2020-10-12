// ----------- Поля ExtIncStates
// --Из базы:
//
//  id
//  ExtIncomingId
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
// ---------------------------------- ExtIncStates ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullExtIncState extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.ExtIncomingId = -1
    this.DepartmentId = -1
    this.StateId = -1
  }

  toJSON () {
    return {
      id: this.id,
      ExtIncomingId: this.ExtIncomingId,
      DepartmentId: this.DepartmentId,
      StateId: this.StateId
    }
  }

  clone () {
    return new NullExtIncState()
  }
}

export class ExtIncState extends NullExtIncState {
  constructor ({
    id = '',
    ExtIncomingId = '',
    DepartmentId = '',
    StateId = ''
  } = {}) {
    super()
    this.id = id
    this.ExtIncomingId = ExtIncomingId
    this.DepartmentId = DepartmentId
    this.StateId = StateId
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtIncState(obj)
  }
}

export function formExtIncStates (element) {
  return new ExtIncState(element)
}

export async function addExtIncState (instance, item) {
  await common.addItem(instance, 'extIncStates', item)
}

export async function editExtIncState (instance, item) {
  await common.editItem(instance, 'extIncStates', item)
}

export async function editExtIncStates (instance, item) {
  await common.edit(instance, 'extIncStates', item)
}

async function updateDocIncStates (storage, id) {
  const incNum = storage.extIncStates.indexed[id]
  if (!incNum.isValid) { return }
  const doc = storage.extIncomings.indexed[incNum.ExtIncomingId]
  if (!doc.isValid) { return }
  for (const depData of doc.ExtIncDepData) {
    if (depData.state && depData.state.ExtIncStateId === id) {
      if (depData.incNumber) {
        delete depData.state
      } else {
        doc.ExtIncDepData = doc.ExtIncDepData.filter(el => el.state.ExtIncStateId !== id)
      }
    }
  }
  const docToSave = doc.toJSON()
  await storage.extIncomings.edit(docToSave.id, docToSave)
}

export async function deleteExtIncStates (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDocIncStates(storage, id)
  }
  if (itemsId.length) {
    storage.extIncStates.delete(itemsId)
  }
}
