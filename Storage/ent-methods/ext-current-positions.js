// import Docs from '../docs'
import { getFormatedDate } from '@/utils/date'
// import { }

// -- Из базы:
//  id
//  startDate
//  endDate
//  ExtEmployeeId
//  PositionId
//  OrganisationId
//  updatedAt
//
// -- Ссылки:
//  ExtEmployee
//  Position
//  Organisation
//
// -- Вычисляемые:
//  posName
//  extEmployee
//  extEmployeeDat
//  position
//  organisation

// ------------------------------------------------------------------------------------------------------
// ---------------------------------- ExtCurrentPosition ------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import { NullPosition } from '@/Storage/ent-methods/positions'
import { NullExtEmployee } from '@/Storage/ent-methods/ext-employees'
import { NullOrganisation } from '@/Storage/ent-methods/organisations'
import * as common from './common'

export class NullExtCurrentPosition extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.startDate = ''
    this.endDate = ''
    this.ExtEmployeeId = -1
    this.PositionId = -1
    this.OrganisationId = -1
    this.updatedAt = ''
  }

  get ExtEmployee () {
    return new NullExtEmployee()
  }

  get Position () {
    return new NullPosition()
  }

  get Organisation () {
    return new NullOrganisation()
  }

  get posName () {
    return this.ExtEmployee.isValid
      ? this.Position.isValid
        ? this.Organisation.isValid
          ? `${this.ExtEmployee.secondName || ''} ${this.ExtEmployee.firstName[0] || ''}.${this.ExtEmployee.middleName[0] || ''}. ${this.Position.posName || ''} (${this.Organisation.orgName || ''})`
          : 'Организация не найдена'
        : 'Должность не найдена'
      : 'Работник не найден'
  }

  get extEmployee () {
    return this.ExtEmployee.isValid
      ? `${this.ExtEmployee.secondName || ''} ${this.ExtEmployee.firstName[0] || ''}.${this.ExtEmployee.middleName[0] || ''}.`
      : 'Работник не найден'
  }

  get extEmployeeDat () {
    return this.ExtEmployee.isValid
      ? `${this.ExtEmployee.secondNameDat || this.ExtEmployee.secondName || ''} ${this.ExtEmployee.firstName[0] || ''}.${this.ExtEmployee.middleName[0] || ''}.`
      : 'Работник не найден'
  }

  get position () {
    return this.Position.isValid
      ? this.Position.posName
      : 'Должность не найдена'
  }

  get organisation () {
    return this.Organisation.isValid
      ? this.Organisation.orgName
      : 'Организация не найдена'
  }

  toJSON () {
    return {
      id: this.id,
      startDate: this.startDate,
      endDate: this.endDate,
      ExtEmployeeId: this.ExtEmployeeId,
      PositionId: this.PositionId,
      OrganisationId: this.OrganisationId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullExtCurrentPosition()
  }
}

export class ExtCurrentPosition extends NullExtCurrentPosition {
  constructor ({
    id = '',
    startDate = '',
    endDate = '',
    ExtEmployeeId = '',
    PositionId = '',
    OrganisationId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.startDate = getFormatedDate(startDate)
    this.endDate = getFormatedDate(endDate)
    this.ExtEmployeeId = ExtEmployeeId
    this.PositionId = PositionId
    this.OrganisationId = OrganisationId
    this.updatedAt = updatedAt
  }

  get ExtEmployee () {
    return this.docs.buffer.extEmployees.indexed[this.ExtEmployeeId]
  }

  get Position () {
    return this.docs.buffer.positions.indexed[this.PositionId]
  }

  get Organisation () {
    return this.docs.buffer.organisations.indexed[this.OrganisationId]
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtCurrentPosition(obj)
  }
}

export function formExtCurrentPositions (element) {
  return new ExtCurrentPosition(element)
}

export async function addExtCurrentPosition (instance, item) {
  const storage = await common.getStorage(instance)
  await common.addItem(instance, 'extCurrentPositions', item)
  await updateExtEmployeeByAddCurPos(storage, item.id)
}

export async function editExtCurrentPosition (instance, item) {
  await common.editItem(instance, 'extCurrentPositions', item)
}

export async function editExtCurrentPositions (instance, item) {
  await common.edit(instance, 'extCurrentPositions', item)
}

async function updateExtEmployeeByAddCurPos (storage, id) {
  const extCurPos = storage.extCurrentPositions.indexed[id]
  if (extCurPos.isValid) {
    const extEmployeeToUpdate = extCurPos.ExtEmployee
    if (!extEmployeeToUpdate.extCurrentPositionsId.includes(id)) {
      extEmployeeToUpdate.extCurrentPositionsId.push(id)
      const empToSave = extEmployeeToUpdate.toJSON()
      await storage.extEmployees.edit(empToSave.id, empToSave)
    }
  }
}

async function updateRelExtInc (storage, id) {
  for (let i = 0; i < storage.extIncomings.items.length; i++) {
    const el = storage.extIncomings.items[i]
    if (el.authorsId.includes(id)) {
      el.authorsId = el.authorsId.filter(it => it !== id)
      const docToSave = el.toJSON()
      await storage.extIncomings.edit(docToSave.id, docToSave)
    }
  }
}
async function updateRelExtOut (storage, id) {
  for (let i = 0; i < storage.extOutgoings.items.length; i++) {
    const el = storage.extOutgoings.items[i]
    if (el.addresseesId.includes(id)) {
      el.addresseesId = el.addresseesId.filter(it => it !== id)
      const docToSave = el.toJSON()
      await storage.extOutgoings.edit(docToSave.id, docToSave)
    }
  }
}
async function updateExtEmployees (storage, id) {
  for (let i = 0; i < storage.extEmployees.items.length; i++) {
    const el = storage.extEmployees.items[i]
    if (el.extCurrentPositionsId.includes(id)) {
      el.extCurrentPositionsId = el.extCurrentPositionsId.filter(it => it !== id)
      const empToSave = el.toJSON()
      await storage.extEmployees.edit(empToSave.id, empToSave)
    }
  }
}

export async function deleteExtCurrentPositions (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      updateExtEmployees(storage, id),
      updateRelExtInc(storage, id),
      updateRelExtOut(storage, id)
    ])
  }
  await storage.extCurrentPositions.delete(itemsId)
}
