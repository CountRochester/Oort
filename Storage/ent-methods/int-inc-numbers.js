// ----------- Поля IntIncNumbers
// --Из базы:
//
//  id
//  incNumber
//  incDate
//  prefix
//  DepartmentId
//  IntIncomingId
//
// --Вычисляемые:
//
//
// --Ссылки:
//
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- IntIncNumbers ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullIntIncNumber extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.incNumber = ''
    this.incDate = ''
    this.prefix = ''
    this.DepartmentId = -1
    this.IntIncomingId = -1
  }

  toJSON () {
    return {
      id: this.id,
      incNumber: this.incNumber,
      incDate: this.incDate,
      prefix: this.prefix,
      DepartmentId: this.DepartmentId,
      IntIncomingId: this.IntIncomingId
    }
  }

  clone () {
    return new NullIntIncNumber()
  }
}

export class IntIncNumber extends NullIntIncNumber {
  constructor ({
    id = '',
    incNumber = '',
    incDate = new Date().toISOString().substr(0, 10),
    prefix = '',
    DepartmentId = '',
    IntIncomingId = ''
  } = {}) {
    super()
    this.id = id
    this.incNumber = incNumber
    this.incDate = incDate
    this.prefix = prefix
    this.DepartmentId = DepartmentId
    this.IntIncomingId = IntIncomingId
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new IntIncNumber(obj)
  }
}

export function formIntIncNumbers (element) {
  return new IntIncNumber(element)
}

export async function addIntIncNumber (instance, item) {
  await common.addItem(instance, 'intIncNumbers', item)
}

export async function editIntIncNumber (instance, item) {
  await common.editItem(instance, 'intIncNumbers', item)
}

export async function editIntIncNumbers (instance, item) {
  await common.edit(instance, 'intIncNumbers', item)
}

async function updateDocIncNumbers (storage, id) {
  const incNum = storage.intIncNumbers.indexed[id]
  if (!incNum.isValid) { return }
  const doc = storage.intIncomings.indexed[incNum.IntIncomingId]
  if (!doc.isValid) { return }
  for (const depData of doc.IntIncDepData) {
    if (depData.incNumber && depData.incNumber.IntIncNumberId === id) {
      if (depData.state) {
        delete depData.incNumber
      } else {
        doc.IntIncDepData = doc.IntIncDepData.filter(el => el.incNumber.IntIncNumberId !== id)
      }
    }
  }
  const docToSave = doc.toJSON()
  await storage.intIncomings.edit(docToSave.id, docToSave)
}

export async function deleteIntIncNumbers (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDocIncNumbers(storage, id)
  }
  storage.intIncNumbers.delete(itemsId)
}
