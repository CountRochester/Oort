
// -- Из базы:
//  id
//  file
//  InternalId
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- InternalFiles --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullInternalFile extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.file = ''
    this.InternalId = -1
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      file: this.file,
      InternalId: this.InternalId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullInternalFile()
  }
}

export class InternalFile extends NullInternalFile {
  constructor ({
    id = '',
    file = '',
    InternalId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.file = file
    this.InternalId = InternalId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new InternalFile(obj)
  }
}

export function formInternalFiles (element) {
  return new InternalFile(element)
}

export async function addInternalFile (instance, item) {
  await common.addItem(instance, 'internalFiles', item)
}

export async function editInternalFile (instance, item) {
  await common.editItem(instance, 'internalFiles', item)
}

export async function editInternalFiles (instance, item) {
  await common.edit(instance, 'internalFiles', item)
}

async function updateDoc (storage, id) {
  const file = storage.internalFiles.indexed[id]
  if (!file.isValid) { return }
  const doc = storage.internals.indexed[file.InternalId]
  if (!doc.isValid) { return }
  doc.filesId = doc.filesId.filter(el => el !== id)
  const docToSave = doc.toJSON()
  await storage.internals.edit(docToSave.id, docToSave)
}

export async function deleteInternalFiles (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDoc(storage, id)
  }
  storage.internalFiles.delete(itemsId)
}
