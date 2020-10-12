// ----------- Поля IntIncStates
// --Из базы:
//
//  id
//  text
//  expirationDate
//  extIncoming
//  intIncoming
//  internal
//  author
//  executants
//  complete
//  updatedAt
//
//  color
//  darkText
//
// --Вычисляемые:
//
//
// --Ссылки:
//
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Resolutions ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullResolution extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.text = ''
    this.expirationDate = ''
    this.extIncoming = -1
    this.intIncoming = -1
    this.internal = -1
    this.author = -1
    this.executants = []
    this.complete = false
    this.updatedAt = ''
    this.color = 'green'
    this.darkText = true
  }

  toJSON () {
    return {
      id: this.id,
      text: this.text,
      expirationDate: this.expirationDate,
      extIncoming: this.extIncoming,
      intIncoming: this.intIncoming,
      internal: this.internal,
      author: this.author,
      executants: this.executants,
      complete: this.complete,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullResolution()
  }
}

export class Resolution extends NullResolution {
  constructor ({
    id = '',
    text = '',
    expirationDate = '',
    extIncoming = '',
    intIncoming = '',
    internal = '',
    author = '',
    executants = [],
    complete = false,
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.text = text
    this.expirationDate = expirationDate
    this.extIncoming = extIncoming
    this.intIncoming = intIncoming
    this.internal = internal
    this.author = author
    this.executants = executants
    this.complete = complete
    this.updatedAt = updatedAt
    let color = 'green'
    let darkText = true
    if (this.expirationDate) {
      const d = this.expirationDate.split('.')
      const date = new Date(d[2], d[1] - 1, d[0])
      const dd = date - Date.now()
      if (dd > (86400000 * 3)) {
        color = 'green'
      } else if (dd <= (86400000 * 3) && dd > 0) {
        color = 'yellow lighten-1'
        darkText = false
      } else {
        color = 'red'
      }
    }
    this.color = color
    this.darkText = darkText
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Resolution(obj)
  }
}

export function formResolutions (element) {
  return new Resolution(element)
}

export async function addResolution (instance, item) {
  await common.addItem(instance, 'resolutions', item)
}

export async function editResolution (instance, item) {
  await common.editItem(instance, 'resolutions', item)
}

export async function editResolutions (instance, item) {
  await common.edit(instance, 'resolutions', item)
}

async function updateDoc (storage, id) {
  const resolution = storage.resolutions.indexed[id]
  if (!resolution.isValid) { return }
  let doc, entity
  if (resolution.extIncoming) {
    doc = storage.extIncomings.indexed[resolution.extIncoming]
    entity = 'extIncomings'
  } else if (resolution.intIncoming) {
    doc = storage.intIncomings.indexed[resolution.intIncoming]
    entity = 'intIncomings'
  } else if (resolution.internal) {
    doc = storage.internals.indexed[resolution.internal]
    entity = 'internals'
  }
  if (doc.isValid) {
    if (doc.resolutions.includes(id)) {
      doc.resolutions = doc.resolutions.filter(el => el !== id)
    }
    const docToSave = doc.toJSON()
    await storage[entity].edit(docToSave.id, docToSave)
  }
}

export async function deleteResolutions (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDoc(storage, id)
  }
  storage.resolutions.delete(itemsId)
}
