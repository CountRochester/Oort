// ----------- Поля InternalIncNumbers
// --Из базы:
//
//  id
//  incNumber
//  incDate
//  prefix
//  DepartmentId
//  InternalId
//
// --Вычисляемые:
//
//
// --Ссылки:
//
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- InternalIncNumbers ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullInternalIncNumber extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.incNumber = ''
    this.incDate = ''
    this.prefix = ''
    this.DepartmentId = -1
    this.InternalId = -1
  }

  toJSON () {
    return {
      id: this.id,
      incNumber: this.incNumber,
      incDate: this.incDate,
      prefix: this.prefix,
      DepartmentId: this.DepartmentId,
      InternalId: this.InternalId
    }
  }

  clone () {
    return new NullInternalIncNumber()
  }
}

export class InternalIncNumber extends NullInternalIncNumber {
  constructor ({
    id = '',
    incNumber = '',
    incDate = new Date().toISOString().substr(0, 10),
    prefix = '',
    DepartmentId = '',
    InternalId = ''
  } = {}) {
    super()
    this.id = id
    this.incNumber = incNumber
    this.incDate = incDate
    this.prefix = prefix
    this.DepartmentId = DepartmentId
    this.InternalId = InternalId
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new InternalIncNumber(obj)
  }
}

export function formInternalIncNumbers (element) {
  return new InternalIncNumber(element)
}

export async function addInternalIncNumber (instance, item) {
  await common.addItem(instance, 'internalIncNumbers', item)
}

export async function editInternalIncNumber (instance, item) {
  await common.editItem(instance, 'internalIncNumbers', item)
}

export async function editInternalIncNumbers (instance, item) {
  await common.edit(instance, 'internalIncNumbers', item)
}

async function updateDocIncNumbers (storage, id) {
  const incNum = storage.internalIncNumbers.indexed[id]
  if (!incNum.isValid) { return }
  const doc = storage.internals.indexed[incNum.IntIncomingId]
  if (!doc.isValid) { return }
  for (const depData of doc.InternalDepData) {
    if (depData.incNumber && depData.incNumber.InternalIncNumberId === id) {
      if (depData.state) {
        delete depData.incNumber
      } else {
        doc.InternalDepData = doc.InternalDepData.filter(el => el.incNumber.InternalIncNumberId !== id)
      }
    }
  }
  const docToSave = doc.toJSON()
  await storage.internals.edit(docToSave.id, docToSave)
}

export async function deleteInternalIncNumbers (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDocIncNumbers(storage, id)
  }
  storage.internalIncNumbers.delete(itemsId)
}
