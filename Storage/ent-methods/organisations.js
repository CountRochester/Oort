// ----------- Поля Organisations
// --Из базы:
//
//  id
//  orgName
//  postNumber
//  city
//  region
//  street
//  building
//  phone
//  fax
//  email
//  updatedAt
//
// --Вычисляемые:
//
//
// --Ссылки:
//
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Organisations ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullOrganisation extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.orgName = ''
    this.postNumber = ''
    this.city = ''
    this.region = ''
    this.street = ''
    this.building = ''
    this.phone = ''
    this.fax = ''
    this.email = ''
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      orgName: this.orgName,
      postNumber: this.postNumber,
      city: this.city,
      region: this.region,
      street: this.street,
      building: this.building,
      phone: this.phone,
      fax: this.fax,
      email: this.email,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullOrganisation()
  }
}

export class Organisation extends NullOrganisation {
  constructor ({
    id = '',
    orgName = '',
    postNumber = '',
    city = '',
    region = '',
    street = '',
    building = '',
    phone = '',
    fax = '',
    email = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.orgName = orgName
    this.postNumber = postNumber
    this.city = city
    this.region = region
    this.street = street
    this.building = building
    this.phone = phone
    this.fax = fax
    this.email = email
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Organisation(obj)
  }
}

export function formOrganisations (element) {
  return new Organisation(element)
}

export async function addOrganisation (instance, item) {
  await common.addItem(instance, 'organisations', item)
}

export async function editOrganisation (instance, item) {
  await common.editItem(instance, 'organisations', item)
}

export async function editOrganisations (instance, item) {
  await common.edit(instance, 'organisations', item)
}

async function updateExtCurrentPositions (storage, id) {
  for (let i = 0; i < storage.extCurrentPositions.items.length; i++) {
    const el = storage.extCurrentPositions.items[i]
    if (el.OrganisationId === id) {
      el.OrganisationId = null
      const curPosToSave = el.toJSON()
      await storage.extCurrentPositions.edit(curPosToSave.id, curPosToSave)
    }
  }
}

export async function deleteOrganisations (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateExtCurrentPositions(storage, id)
  }
  storage.organisations.delete(itemsId)
}
