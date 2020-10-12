// -- Из базы:
//  id
//  firstName
//  secondName
//  secondNameDat
//  middleName
//  phone1
//  phone2
//  fax
//  email1
//  email2
//  extCurrentPositionsId
//  updatedAt
//
// -- Ссылки:
//  ExtCurrentPositions
//  Organisations
//  Positions
//
// -- Вычисляемые:
//  organisations
//  organisationsId
//  positions
//  positionsId
//  name
//  nameFull
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- ExtEmployees ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullExtEmployee extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.firstName = ''
    this.secondName = ''
    this.secondNameDat = ''
    this.middleName = ''
    this.phone1 = ''
    this.phone2 = ''
    this.fax = ''
    this.email1 = ''
    this.email2 = ''
    this.extCurrentPositionsId = []
    this.updatedAt = ''
  }

  get ExtCurrentPositions () {
    const pos = []
    this.extCurrentPositionsId.forEach((el) => {
      pos.push(this.docs.buffer.extCurrentPositions.indexed[el])
    })
    return pos
  }

  get Organisations () {
    const org = []
    this.ExtCurrentPositions.forEach((el) => {
      org.push(el.Organisation)
    })
    return org
  }

  get Positions () {
    const pos = []
    this.ExtCurrentPositions.forEach((el) => {
      pos.push(el.Position)
    })
    return pos
  }

  get organisations () {
    const org = []
    this.Organisations.forEach((el) => {
      org.push(el.orgName)
    })
    return org
  }

  get organisationsId () {
    const org = []
    this.Organisations.forEach((el) => {
      org.push(el.id)
    })
    return org
  }

  get positions () {
    const pos = []
    this.Positions.forEach((el) => {
      pos.push(el.posName)
    })
    return pos
  }

  get positionsId () {
    const pos = []
    this.Positions.forEach((el) => {
      pos.push(el.id)
    })
    return pos
  }

  get name () {
    return `${this.secondName || ''} ${this.firstName[0] || ''}. ${this.middleName[0] || ''}.`
  }

  get nameFull () {
    return `${this.secondName || ''} ${this.firstName || ''} ${this.middleName || ''}`
  }

  toJSON () {
    return {
      id: this.id,
      firstName: this.firstName,
      secondName: this.secondName,
      secondNameDat: this.secondNameDat,
      middleName: this.middleName,
      phone1: this.phone1,
      phone2: this.phone2,
      fax: this.fax,
      email1: this.email1,
      email2: this.email2,
      extCurrentPositionsId: this.extCurrentPositionsId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullExtEmployee()
  }
}

export class ExtEmployee extends NullExtEmployee {
  constructor ({
    id = '',
    firstName = '',
    secondName = '',
    secondNameDat = '',
    middleName = '',
    phone1 = '',
    phone2 = '',
    fax = '',
    email1 = '',
    email2 = '',
    extCurrentPositionsId = [],
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.firstName = firstName
    this.secondName = secondName
    this.secondNameDat = secondNameDat
    this.middleName = middleName
    this.phone1 = phone1
    this.phone2 = phone2
    this.fax = fax
    this.email1 = email1
    this.email2 = email2
    this.extCurrentPositionsId = extCurrentPositionsId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtEmployee(obj)
  }
}

export function formExtEmployees (element) {
  return new ExtEmployee(element)
}

export async function addExtEmployee (instance, item) {
  await common.addItem(instance, 'extEmployees', item)
}

export async function editExtEmployee (instance, item) {
  await common.editItem(instance, 'extEmployees', item)
}

export async function editExtEmployees (instance, item) {
  await common.edit(instance, 'extEmployees', item)
}

async function deleteRelExtCurrentPositions (storage, id) {
  const itemsToDelete = []
  for (let i = 0; i < storage.extCurrentPositions.items.length; i++) {
    const el = storage.extCurrentPositions.items[i]
    if (el.ExtEmployeeId === id) {
      itemsToDelete.push(el.id)
    }
  }
  if (itemsToDelete.length) {
    await storage.extCurrentPositions.deleteItem(itemsToDelete)
  }
}

export async function deleteExtEmployees (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await deleteRelExtCurrentPositions(storage, id)
  }
  await storage.extEmployees.delete(itemsId)
}
