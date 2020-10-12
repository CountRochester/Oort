// -- Из базы:
//  id
//  number
//  date
//  updatedAt
//
// --Вычисляемые
//  numberDate

// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Contracts ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import * as common from './common'

export class NullContract extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.number = ''
    this.date = ''
    this.updatedAt = ''
  }

  get numberDate () {
    return ''
  }

  toJSON () {
    return {
      id: this.id,
      number: this.number,
      date: this.date,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullContract()
  }
}

export class Contract extends NullContract {
  constructor ({
    id = '',
    number = '',
    date = new Date().toISOString().substr(0, 10),
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.number = number
    this.date = date
    this.updatedAt = updatedAt
  }

  get numberDate () {
    return `№${this.number} от ${this.date}`
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Contract(obj)
  }
}

export function formContracts (element) {
  return new Contract(element)
}

export async function addContracts (instance, item) {
  await common.addItem(instance, 'contracts', item)
}
export async function editContract (instance, item) {
  await common.editItem(instance, 'contracts', item)
}

export async function editContracts (instance, item) {
  await common.edit(instance, 'contracts', item)
}

async function deleteRelTemas (ids, storage) {
  const temasIdsToDelete = []
  for (const id of ids) {
    const contract = storage.contracts.indexed[id]
    if (contract.isValid) {
      storage.temas.items.forEach((el) => {
        if (el.ContractId === id) {
          temasIdsToDelete.push(el.id)
        }
      })
    }
  }
  if (temasIdsToDelete.length) {
    try {
      await storage.temas.deleteItem(temasIdsToDelete)
    } catch (err) {
      console.log(`Ошибка удаления тем id: ${temasIdsToDelete}: ${err}`)
    }
  }
}

export async function deleteContracts (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  await deleteRelTemas(itemsId, storage)
  storage.contracts.delete(itemsId)
}
