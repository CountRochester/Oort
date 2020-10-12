
// -- Из базы:
//  id
//  file
//  IntIncomingId
//  updatedAt
//
// -- Ссылки:
//
//
// -- Вычисляемые:
//

// ------------------------------------------------------------------------------------------------------
// -------------------------------------- IntIncFiles --------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import * as common from './common'

export class NullIntIncFile extends common.Entity {
  constructor () {
    super()
    this.id = -1
    this.file = ''
    this.IntIncomingId = -1
    this.updatedAt = ''
  }

  toJSON () {
    return {
      id: this.id,
      file: this.file,
      IntIncomingId: this.IntIncomingId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullIntIncFile()
  }
}

export class IntIncFile extends NullIntIncFile {
  constructor ({
    id = '',
    file = '',
    IntIncomingId = '',
    updatedAt = new Date().toISOString().substr(0, 10)
  } = {}) {
    super()
    this.id = id
    this.file = file
    this.IntIncomingId = IntIncomingId
    this.updatedAt = updatedAt
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new IntIncFile(obj)
  }
}

export function formIntIncFiles (element) {
  return new IntIncFile(element)
}

export async function addIntIncFile (instance, item) {
  await common.addItem(instance, 'intIncFiles', item)
}

export async function editIntIncFile (instance, item) {
  await common.editItem(instance, 'intIncFiles', item)
}

export async function editIntIncFiles (instance, item) {
  await common.edit(instance, 'intIncFiles', item)
}

async function updateDoc (storage, id) {
  const file = storage.intIncFiles.indexed[id]
  if (!file.isValid) { return }
  const doc = storage.intIncomings.indexed[file.IntIncomingId]
  if (!doc.isValid) { return }
  doc.filesId = doc.filesId.filter(el => el !== id)
  const docToSave = doc.toJSON()
  await storage.intIncomings.edit(docToSave.id, docToSave)
}

export async function deleteIntIncFiles (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await updateDoc(storage, id)
  }
  storage.intIncFiles.delete(itemsId)
}
