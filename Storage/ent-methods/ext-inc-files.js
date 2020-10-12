
// -- Из базы:
//  id
//  file
//  ExtIncomingId
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- ExtIncFiles --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullExtIncFile extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.file = ''
    this.ExtIncomingId = -1
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      file: this.file,
      ExtIncomingId: this.ExtIncomingId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullExtIncFile()
  }
}

export class ExtIncFile extends NullExtIncFile {
  constructor ({
    id = '',
    file = '',
    ExtIncomingId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.file = file
    this.ExtIncomingId = ExtIncomingId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtIncFile(obj)
  }
}

export function formExtIncFiles (element) {
  return new ExtIncFile(element)
}

export async function addExtIncFile (instance, item) {
  await common.addItem(instance, 'extIncFiles', item)
}

export async function editExtIncFile (instance, item) {
  await common.editItem(instance, 'extIncFiles', item)
}

export async function editExtIncFiles (instance, item) {
  await common.edit(instance, 'extIncFiles', item)
}

async function updateDoc (storage, id) {
  const file = storage.extIncFiles.indexed[id]
  if (!file.isValid) { return }
  const doc = storage.extIncomings.indexed[file.ExtIncomingId]
  if (!doc.isValid) { return }
  doc.filesId = doc.filesId.filter(el => el !== id)
  const docToSave = doc.toJSON()
  await storage.extIncomings.edit(docToSave.id, docToSave)
}

export async function deleteExtIncFiles (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDoc(storage, id)
  }
  storage.extIncFiles.delete(itemsId)
}
