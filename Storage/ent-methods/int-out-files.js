
// -- Из базы:
//  id
//  file
//  IntOutgoingId
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- IntOutFiles --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullIntOutFile extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.file = ''
    this.IntOutgoingId = -1
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      file: this.file,
      IntOutgoingId: this.IntOutgoingId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullIntOutFile()
  }
}

export class IntOutFile extends NullIntOutFile {
  constructor ({
    id = '',
    file = '',
    IntOutgoingId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.file = file
    this.IntOutgoingId = IntOutgoingId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new IntOutFile(obj)
  }
}

export function formIntOutFiles (element) {
  return new IntOutFile(element)
}

export async function addIntOutFile (instance, item) {
  await common.addItem(instance, 'intOutFiles', item)
}

export async function editIntOutFile (instance, item) {
  await common.editItem(instance, 'intOutFiles', item)
}

export async function editIntOutFiles (instance, item) {
  await common.edit(instance, 'intOutFiles', item)
}

async function updateDoc (storage, id) {
  const file = storage.intOutFiles.indexed[id]
  if (!file.isValid) { return }
  const doc = storage.intOutgoings.indexed[file.IntOutgoingId]
  if (!doc.isValid) { return }
  doc.filesId = doc.filesId.filter(el => el !== id)
  const docToSave = doc.toJSON()
  await storage.intOutgoings.edit(docToSave.id, docToSave)
}

export async function deleteIntOutFiles (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDoc(storage, id)
  }
  storage.intOutFiles.delete(itemsId)
}
