// ----------- Поля Temas
// --Из базы:
//
//  id
//  name
//  ContractId
//  updatedAt
//
// --Вычисляемые:
//
//  contract
//
// --Ссылки:
//
//  Сontract
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Temas ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import { NullContract } from '@/Storage/ent-methods/contracts'
import * as common from './common'

export class NullTema extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.name = ''
    this.ContractId = -1
    this.updatedAt = ''
  }

  get Сontract () {
    return new NullContract()
  }

  get contract () {
    return ''
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      ContractId: this.ContractId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullTema()
  }
}

export class Tema extends NullTema {
  constructor ({
    id = '',
    name = '',
    ContractId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.name = name
    this.ContractId = ContractId
    this.updatedAt = updatedAt
  }

  get Сontract () {
    return this.docs.buffer.contracts.indexed[this.ContractId]
  }

  get contract () {
    return this.Сontract.number
      ? `от ${this.Сontract.date} №${this.Сontract.number}`
      : 'Контракт не найден'
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Tema(obj)
  }
}

export function formTemas (element) {
  return new Tema(element)
}

export async function addTema (instance, item) {
  await common.addItem(instance, 'temas', item)
}

export async function editTema (instance, item) {
  await common.editItem(instance, 'temas', item)
}

export async function editTemas (instance, item) {
  await common.edit(instance, 'temas', item)
}

async function updateDocTemas (storage, entity, id) {
  for (let i = 0; i < storage[entity].items.length; i++) {
    const el = storage[entity].items[i]
    if (el.temasId.includes(id)) {
      el.temasId = el.temasId.filter(elem => elem !== id)
      const docToSave = el.toJSON()
      await storage[entity].edit(docToSave.id, docToSave)
    }
  }
}

export async function deleteTemas (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      updateDocTemas(storage, 'extIncomings', id),
      updateDocTemas(storage, 'extOutgoings', id),
      updateDocTemas(storage, 'intIncomings', id),
      updateDocTemas(storage, 'intOutgoings', id),
      updateDocTemas(storage, 'internals', id)
    ])
  }
  storage.temas.delete(itemsId)
}
