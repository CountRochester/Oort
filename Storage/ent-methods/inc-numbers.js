// ----------- Поля IncNumbers
// --Из базы:
//
//  id
//  incNumber
//  incDate
//  prefix
//  DepartmentId
//  ExtIncomingId
//
// --Вычисляемые:
//
//
// --Ссылки:
//
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- IncNumbers ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullIncNumber extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.incNumber = ''
    this.incDate = ''
    this.prefix = ''
    this.DepartmentId = -1
    this.ExtIncomingId = -1
  }

  toJSON () {
    return {
      id: this.id,
      incNumber: this.incNumber,
      incDate: this.incDate,
      prefix: this.prefix,
      DepartmentId: this.DepartmentId,
      ExtIncomingId: this.ExtIncomingId
    }
  }

  clone () {
    return new NullIncNumber()
  }
}

export class IncNumber extends NullIncNumber {
  constructor ({
    id = '',
    incNumber = '',
    incDate = new Date().toISOString().substr(0, 10),
    prefix = '',
    DepartmentId = '',
    ExtIncomingId = ''
  } = {}) {
    super()
    this.id = id
    this.incNumber = incNumber
    this.incDate = incDate
    this.prefix = prefix
    this.DepartmentId = DepartmentId
    this.ExtIncomingId = ExtIncomingId
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new IncNumber(obj)
  }
}

export function formIncNumbers (element) {
  return new IncNumber(element)
}

export async function addIncNumber (instance, item) {
  await common.addItem(instance, 'incNumbers', item)
}

export async function editIncNumber (instance, item) {
  await common.editItem(instance, 'incNumbers', item)
}

export async function editIncNumbers (instance, item) {
  await common.edit(instance, 'incNumbers', item)
}

async function updateDocIncNumbers (storage, id) {
  const incNum = storage.incNumbers.indexed[id]
  if (!incNum.isValid) { return }
  const doc = storage.extIncomings.indexed[incNum.ExtIncomingId]
  if (!doc.isValid) { return }
  for (const depData of doc.ExtIncDepData) {
    if (depData.incNumber && depData.incNumber.ExtIncNumberId === id) {
      if (depData.state) {
        delete depData.incNumber
      } else {
        doc.ExtIncDepData = doc.ExtIncDepData.filter(el => el.incNumber.ExtIncNumberId !== id)
      }
    }
  }
  const docToSave = doc.toJSON()
  await storage.extIncomings.edit(docToSave.id, docToSave)
}

export async function deleteIncNumbers (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  if (!itemsId.length) { return }
  for (const id of itemsId) {
    await updateDocIncNumbers(storage, id)
  }
  await storage.incNumbers.delete(itemsId)
}
