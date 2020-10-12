// const safeStringify = require('fast-safe-stringify')

// -- Из базы:
//  id
//  name
//  type
//  parentStateId
//  updatedAt
//
// -- Новые:
//  props
//
// -- Ссылки:
//
//  PrevState
//  NextState
//
// -- Вычисляемые:
//
//  prevState
//  nextState
// ------------------------------------------------------------------------------------------------------

// type: 'typeName props'
// typeName: String
// props: Number
// Входящие:
// propsItems:  111111
//   0 - переход по требованию пользователя (1)
//   1 - есть входящий номер (2)
//   2 - есть резолюция (4)
//   3 - принято к исполнению (8)
//   4 - запрос на отметку резолюции (16)
//   5 - все резолюции исполнены (32)
// Исходящие:
// propsItems: 1111
//   0 - переход по требованию пользователя (1)
//   1 - документ подписан (2)
//   2 - получен исходящий номер (4)
//   3 - документ разослан (8)

// ------------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- States --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullState extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.name = ''
    this.type = ''
    this.props = 0
    this.parentStateId = -1
    this.updatedAt = ''
  }

  get PrevState () {
    if (this.parentStateId && this.docs.buffer.states.indexed.length) {
      return this.docs.buffer.states.indexed[this.parentStateId]
    } else { return new NullState() }
  }

  get NextState () {
    if (this.docs.buffer.states.items.length) {
      return this.docs.buffer.states.items.find(elem => elem.parentStateId === this.id) || new NullState()
    } else { return new NullState() }
  }

  get prevState () {
    return this.PrevState.name
  }

  get nextState () {
    return this.NextState.name
  }

  get typeReqs () {
    return `${this.type}${this.props ? ' ' + this.props : ''}`
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      // type: this.type,
      type: this.typeReqs,
      parentStateId: this.parentStateId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullState()
  }
}

export class State extends NullState {
  constructor ({
    id = '',
    name = '',
    type = '',
    parentStateId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.name = name
    const typeArr = type.split(' ')
    this.type = typeArr[0]
    this.props = typeArr[1] ? +typeArr[1] : 0
    this.parentStateId = parentStateId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new State(obj)
  }
}

export function formStates (element) {
  return new State(element)
}

export async function addState (instance, item) {
  await common.addItem(instance, 'states', item)
}

export async function editState (instance, item) {
  await common.editItem(instance, 'states', item)
}

export async function editStates (instance, item) {
  await common.edit(instance, 'states', item)
}

async function deleteRelIncStates (storage, entity, id) {
  const itemsToDelete = []
  for (let i = 0; i < storage[entity].items.length; i++) {
    const el = storage[entity].items[i]
    if (el.StateId === id) {
      itemsToDelete.push(el.id)
    }
  }
  if (itemsToDelete.length) {
    await storage[entity].deleteItem(itemsToDelete)
  }
}

async function updateDocStates (storage, entity, id) {
  for (let i = 0; i < storage[entity].items.length; i++) {
    const el = storage[entity].items[i]
    if (el.stateId === id) {
      el.stateId = null
      const elToSave = el.toJSON()
      await storage[entity].edit(elToSave.id, elToSave)
    }
  }
}

async function updateNextState (storage, id) {
  const state = storage.states.indexed[id]
  const nextState = state.NextState
  if (nextState.isValid) {
    nextState.parentStateId = null
    const nextStateToSave = nextState.toJSON()
    await storage.states.edit(nextStateToSave.id, nextStateToSave)
  }
}

export async function deleteStates (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await Promise.all([
      deleteRelIncStates(storage, 'extIncStates', id),
      deleteRelIncStates(storage, 'intIncStates', id),
      deleteRelIncStates(storage, 'internalIncStates', id),
      updateDocStates(storage, 'extOutgoings', id),
      updateDocStates(storage, 'intOutgoings', id),
      updateNextState(storage, id)
    ])
  }
  storage.states.delete(itemsId)
}
