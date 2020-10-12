
// -- Из базы:
//  id
//  file
//  ExtOutgoingId
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- ExtOutFiles --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullExtOutFile extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.file = ''
    this.ExtOutgoingId = -1
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      file: this.file,
      ExtOutgoingId: this.ExtOutgoingId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullExtOutFile()
  }
}

export class ExtOutFile extends NullExtOutFile {
  constructor ({
    id = '',
    file = '',
    ExtOutgoingId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.file = file
    this.ExtOutgoingId = ExtOutgoingId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtOutFile(obj)
  }
}

export function formExtOutFiles (element) {
  return new ExtOutFile(element)
}

export async function addExtOutFile (instance, item) {
  await common.addItem(instance, 'extOutFiles', item)
}

export async function editExtOutFile (instance, item) {
  await common.editItem(instance, 'extOutFiles', item)
}

export async function editExtOutFiles (instance, item) {
  await common.edit(instance, 'extOutFiles', item)
}

async function updateDoc (storage, id) {
  const file = storage.extOutFiles.indexed[id]
  if (!file.isValid) { return }
  const doc = storage.extOutgoings.indexed[file.ExtOutgoingId]
  if (doc.isValid) {
    doc.filesId = doc.filesId.filter(el => el !== id)
    const docToSave = doc.toJSON()
    await storage.extOutgoings.edit(docToSave.id, docToSave)
  }
}

export async function deleteExtOutFiles (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDoc(storage, id)
  }
  storage.extOutFiles.delete(itemsId)
}
