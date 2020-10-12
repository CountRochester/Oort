// ----------- Поля IntIncStates
// --Из базы:
//
//  id
//  IntIncomingId
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
// ---------------------------------- IntIncStates ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullIntIncState extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.IntIncomingId = -1
    this.DepartmentId = -1
    this.StateId = -1
  }

  toJSON () {
    return {
      id: this.id,
      IntIncomingId: this.IntIncomingId,
      DepartmentId: this.DepartmentId,
      StateId: this.StateId
    }
  }

  clone () {
    return new NullIntIncState()
  }
}

export class IntIncState extends NullIntIncState {
  constructor ({
    id = '',
    IntIncomingId = '',
    DepartmentId = '',
    StateId = ''
  } = {}) {
    super()
    this.id = id
    this.IntIncomingId = IntIncomingId
    this.DepartmentId = DepartmentId
    this.StateId = StateId
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new IntIncState(obj)
  }
}

export function formIntIncStates (element) {
  return new IntIncState(element)
}

export async function addIntIncState (instance, item) {
  await common.addItem(instance, 'intIncStates', item)
}

export async function editIntIncState (instance, item) {
  await common.editItem(instance, 'intIncStates', item)
}

export async function editIntIncStates (instance, item) {
  await common.edit(instance, 'intIncStates', item)
}

async function updateDocIncStates (storage, id) {
  const incNum = storage.intIncStates.indexed[id]
  if (!incNum.isValid) { return }
  const doc = storage.intIncomings.indexed[incNum.IntIncomingId]
  if (!doc.isValid) { return }
  for (const depData of doc.IntIncDepData) {
    if (depData.state && depData.state.IntIncStateId === id) {
      if (depData.incNumber) {
        delete depData.state
      } else {
        doc.IntIncDepData = doc.IntIncDepData.filter(el => el.state.IntIncStateId !== id)
      }
    }
  }
  const docToSave = doc.toJSON()
  await storage.intIncomings.edit(docToSave.id, docToSave)
}

export async function deleteIntIncStates (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDocIncStates(storage, id)
  }
  if (itemsId.length) {
    storage.intIncStates.delete(itemsId)
  }
}
