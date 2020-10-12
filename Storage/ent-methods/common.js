// import entitity from '@/Storage/entititys'
import { app, store } from '@/utils/is-client'

const buffer = []
const entity = [
  'contracts',
  'temas',
  'organisations',
  'states',
  'types',
  'positions',
  'departments',
  'subdivisions',
  'currentPositions',
  'extCurrentPositions',
  'employees',
  'extEmployees',
  'extIncomings',
  'extOutgoings',
  'intIncomings',
  'intOutgoings',
  'internals',
  'incNumbers',
  'intIncNumbers',
  'internalIncNumbers',
  'extIncFiles',
  'extOutFiles',
  'intIncFiles',
  'intOutFiles',
  'internalFiles',
  'extIncStates',
  'intIncStates',
  'internalIncStates',
  'resolutions'
]
entity.forEach((el) => {
  buffer[el] = {
    items: [],
    indexed: []
  }
})
const defaultDocs = { buffer }

export async function getStorage (instance) {
  let storage
  const _app = app()
  if (!_app) {
    const inst = await instance
    storage = inst.buffer
  } else {
    storage = _app.$docs.buffer
  }
  return storage
}

export async function addItem (instance, entity, item) {
  const storage = await getStorage(instance)
  await storage[entity].insert(item)
  await storage[entity].update(item.id)
}

export function getSelectedDep () {
  let selectedDep = null
  const _store = store()
  if (_store) {
    selectedDep = _store.state.auth.currentUser.selectedDep
  }
  return selectedDep
}

export async function edit (instance, entity, item) {
  const storage = await getStorage(instance)
  await storage[entity].edit(item.id, item)
}

export function getItemToAddEditDelete ({
  storage,
  storageName,
  idPropName,
  [idPropName]: idProp,
  array
}) {
  const itemsToEdit = []
  const itemsToAdd = []
  const itemsToDelete = []
  const allItems = []
  storage[storageName].items.forEach((el) => {
    if (el[idPropName] === idProp) {
      allItems.push(el)
    }
  })
  array.forEach((item) => {
    const existedItem = storage[storageName].indexed[item.id]
    if (existedItem.isValid) {
      itemsToEdit.push(item)
    } else {
      itemsToAdd.push(item)
    }
  })
  allItems.forEach((el) => {
    const isInToEdit = itemsToEdit.find(element => element.id === el.id)
    if (!isInToEdit) {
      itemsToDelete.push(el.id)
    }
  })
  return { itemsToAdd, itemsToEdit, itemsToDelete }
}

export async function manageElements (instance, storageName, { itemsToAdd = [], itemsToEdit = [], itemsToDelete = [] }) {
  const storage = await getStorage(instance)
  await storage[storageName].insert(itemsToAdd)
  await storage[storageName].editItem(itemsToEdit)
  await storage[storageName].deleteItem(itemsToDelete)
}

export async function editItem (instance, entity, item) {
  const storage = await getStorage(instance)
  const editedItem = storage[entity].items.find(el => el.id === item.id)
  if (editedItem) {
    for (const key in item) {
      const descriptor = Object.getOwnPropertyDescriptor(editedItem, key)
      if (descriptor) {
        if ((descriptor.writable === true || descriptor.writable === undefined) && descriptor.set) {
          editedItem[key] = item[key]
        }
      }
    }
    return editedItem
  }
}

export async function editItems (instance, entity, items) {
  for (const item of items) {
    await edit(instance, entity, item)
  }
}

export async function editElements (instance, elements) {
  const storage = await getStorage(instance)
  for (const element of elements) {
    if (element.items?.length) {
      await editItems(instance, element.storage, element.items)
    } else {
      await edit(instance, element.storage, element.items)
    }
  }
  for (const element of elements) {
    storage[element.storage].updateAll()
  }
}

export async function addElements (instance, elements) {
  if (!elements.length) { return }
  const storage = await getStorage(instance)
  for (const element of elements) {
    await addItem(instance, element.storage, element.items)
  }
  for (const element of elements) {
    storage[element.storage].updateAll()
  }
}

export async function getItemsId (instance, ids) {
  const storage = await getStorage(instance)
  let itemsId
  if (Object.prototype.toString.call(ids) === '[object Array]') {
    itemsId = ids
  } else {
    itemsId = [ids]
  }
  return { itemsId, storage }
}

export class Entity {
  docs = defaultDocs
  constructor () {
    const _app = app()
    if (_app) {
      this.docs = _app.$docs
    }
  }

  get isValid () {
    if (this.id === '') { return false }
    if (this.id === -1) { return false }
    if (this.id === 0) { return false }
    if (this.id === '0') { return false }
    if (this.id === '-1') { return false }
    if (typeof this.id !== 'string' && typeof this.id !== 'number') { return false }
    return true
  }

  toJSON () {
    return new Error('Не определён метод toJSON')
  }

  clone () {
    return new Error('Не определён метод clone')
  }
}
