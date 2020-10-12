
// -- Из базы:
//  id
//  name
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- Types --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullType extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.name = ''
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullType()
  }
}

export class Type extends NullType {
  constructor ({
    id = '',
    name = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.name = name
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Type(obj)
  }
}

export function formTypes (element) {
  return new Type(element)
}

export async function addType (instance, item) {
  await common.addItem(instance, 'types', item)
}

export async function editType (instance, item) {
  await common.editItem(instance, 'types', item)
}

export async function editTypes (instance, item) {
  await common.edit(instance, 'types', item)
}

async function updateDocTypes (storage, entity, id) {
  for (let i = 0; i < storage[entity].items.length; i++) {
    const el = storage[entity].items[i]
    if (el.typeId === id) {
      el.typeId = null
      const docToSave = el.toJSON()
      await storage[entity].edit(docToSave.id, docToSave)
    }
  }
}

export async function deleteTypes (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      updateDocTypes(storage, 'extIncomings', id),
      updateDocTypes(storage, 'extOutgoings', id),
      updateDocTypes(storage, 'intIncomings', id),
      updateDocTypes(storage, 'intOutgoings', id),
      updateDocTypes(storage, 'internals', id)
    ])
  }
  storage.types.delete(itemsId)
}
