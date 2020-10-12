
// -- Из базы:
//  id
//  posName
//  posNameDat
//  canSignExtDocs
//  canSignIntDocs
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- Positions --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullPosition extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.posName = ''
    this.posNameDat = ''
    this.canSignExtDocs = false
    this.canSignIntDocs = false
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      posName: this.posName,
      posNameDat: this.posNameDat,
      canSignExtDocs: this.canSignExtDocs,
      canSignIntDocs: this.canSignIntDocs,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullPosition()
  }
}

export class Position extends NullPosition {
  constructor ({
    id = '',
    posName = '',
    posNameDat = '',
    canSignExtDocs = false,
    canSignIntDocs = false,
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.posName = posName
    this.posNameDat = posNameDat
    this.canSignExtDocs = canSignExtDocs
    this.canSignIntDocs = canSignIntDocs
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Position(obj)
  }
}

export function formPositions (element) {
  return new Position(element)
}

export async function addPosition (instance, item) {
  await common.addItem(instance, 'positions', item)
}

export async function editPosition (instance, item) {
  await common.editItem(instance, 'positions', item)
}

export async function editPositions (instance, item) {
  await common.edit(instance, 'positions', item)
}

async function updateCurrentPositions (storage, entity, id) {
  for (let i = 0; i < storage[entity].items.length; i++) {
    const el = storage[entity].items[i]
    if (el.PositionId === id) {
      el.PositionId = null
      const curPosToSave = el.toJSON()
      await storage[entity].edit(curPosToSave.id, curPosToSave)
    }
  }
}

export async function deletePositions (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      updateCurrentPositions(storage, 'currentPositions', id),
      updateCurrentPositions(storage, 'extCurrentPositions', id)
    ])
  }
  storage.positions.delete(itemsId)
}
