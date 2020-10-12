// ----------- Поля ExtOutgoings
// --Из базы:
// id
// outNumber
// outDate
// prefix
// subject
// author
// authorId
// type
// typeId
// state
// stateId
// addressees
// addresseesId
// podpisants
// podpisantsId
// temas
// temasId
// organisations
// organisationsId
// department
// departmentId
// note
// files
// filesId
// isAnswerOn
// isAnswerOnId
// updatedAt
//
// ------------------------------------------------------------------------------------------------------
// --Заимствуются:
//
//  id
//  outNumber
//  outDate
//  prefix
//  subject
//  note
//  updatedAt
//
// --Заимствуются с сеттерами:
//
//  authorId
//  typeId
//  stateId
//  addresseesId
//  podpisantsId
//  temasId
//  isAnswerOnId
//  filesId
//
// --Вычисляемые:
//
//  author
//  departmentId
//  department
//  type
//  state
//  addressees
//  podpisants
//  temas
//  organisationsId
//  organisations
//  isAnswerOn
//  files
//  dateIsh
//
// --Ссылки:
//
//  Author
//  Type
//  State
//  Addressees
//  Podpisants
//  Temas
//  Organisations
//  Department
//  IsAnswerOn
//  Files
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- ExtOutgoings ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import moment from 'moment'
import { dateConvert } from '@/utils/date.js'
import { NullCurrentPosition } from '@/Storage/ent-methods/current-positions'
import { NullType } from '@/Storage/ent-methods/types'
import { NullState } from '@/Storage/ent-methods/states'
import * as common from './common'

export class NullExtOutgoing extends common.Entity {
  #_authorId
  #_typeId
  #_stateId
  #_addresseesId
  #_podpisantsId
  #_temasId
  #_isAnswerOnId
  #_filesId

  constructor () {
    super()
    this.id = -1
    this.outNumber = ''
    this.outDate = ''
    this.prefix = ''
    this.subject = ''
    this.note = ''
    this.updatedAt = ''

    this.#_authorId = -1
    this.#_typeId = -1
    this.#_stateId = -1
    this.#_addresseesId = []
    this.#_podpisantsId = []
    this.#_temasId = []
    this.#_isAnswerOnId = []
    this.#_filesId = []

    this.Author = new NullCurrentPosition()
    this.Type = new NullType()
    this.State = new NullState()

    this.Addressees = []
    this.Podpisants = []
    this.Temas = []
    this.IsAnswerOn = []
    this.Files = []
  }

  get authorId () {
    return this.#_authorId
  }

  get typeId () {
    return this.#_typeId
  }

  get stateId () {
    return this.#_stateId
  }

  get addresseesId () {
    return this.#_addresseesId
  }

  get podpisantsId () {
    return this.#_podpisantsId
  }

  get temasId () {
    return this.#_temasId
  }

  get isAnswerOnId () {
    return this.#_isAnswerOnId
  }

  get filesId () {
    return this.#_filesId
  }

  get Organisations () {
    const orgs = []
    this.Addressees.forEach((el) => {
      orgs.push(el.Organisation)
    })
    return orgs
  }

  get Department () {
    return this.Author.Department
  }

  get author () {
    return this.Author.employee
  }

  get departmentId () {
    return this.Author.DepartmentId
  }

  get department () {
    return this.Author.Department.shortName
  }

  get type () {
    return this.Type.name
  }

  get state () {
    return this.State.name
  }

  get addressees () {
    const output = []
    this.Addressees.forEach((el) => { output.push(el.posName) })
    return output.join('\n')
  }

  get podpisants () {
    const output = []
    this.Podpisants.forEach((el) => { output.push(el.posName) })
    return output.join('\n')
  }

  get temas () {
    const output = []
    this.Temas.forEach((el) => { output.push(el.name) })
    return output.join('\n')
  }

  get organisationsId () {
    const orgsId = []
    this.Addressees.forEach((el) => {
      orgsId.push(el.OrganisationId)
    })
    return orgsId
  }

  get organisations () {
    const output = []
    this.Organisations.forEach((el) => { output.push(el.orgName) })
    return output.join('\n')
  }

  get isAnswerOn () {
    const output = []
    this.IsAnswerOn.forEach((el) => {
      output.push(`от ${el.extDate} №${el.extNumber}`)
    })
    return output.join('\n')
  }

  get files () {
    const arr = []
    this.Files.forEach((el) => {
      arr.push(el.file)
    })
    return arr
  }

  get dateIsh () {
    return this.outDate ? +moment(dateConvert(this.outDate)) : ''
  }

  toJSON () {
    return {
      id: this.id,
      outNumber: this.outNumber,
      outDate: this.outDate,
      prefix: this.prefix,
      subject: this.subject,
      note: this.note,
      authorId: this.authorId,
      typeId: this.typeId,
      stateId: this.stateId,
      addresseesId: this.addresseesId,
      podpisantsId: this.podpisantsId,
      temasId: this.temasId,
      organisationsId: this.organisationsId,
      isAnswerOnId: this.isAnswerOnId,
      filesId: this.filesId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullExtOutgoing()
  }
}

export class ExtOutgoing extends NullExtOutgoing {
  #_authorId
  #_typeId
  #_stateId
  #_addresseesId
  #_podpisantsId
  #_temasId
  #_isAnswerOnId
  #_filesId

  constructor ({
    id = '',
    outNumber = '',
    outDate = new Date().toISOString().substr(0, 10),
    prefix = '',
    subject = '',
    note = '',
    updatedAt = new Date().toISOString().substr(0, 10),
    authorId = '',
    typeId = '',
    stateId = '',
    addresseesId = [],
    podpisantsId = [],
    temasId = [],
    isAnswerOnId = [],
    filesId = []
  } = {}) {
    super()
    this.id = id
    this.outNumber = outNumber
    this.outDate = outDate
    this.prefix = prefix
    this.subject = subject
    this.note = note
    this.updatedAt = updatedAt

    this.#_authorId = authorId
    this.#_typeId = typeId
    this.#_stateId = stateId
    this.#_addresseesId = addresseesId
    this.#_podpisantsId = podpisantsId
    this.#_temasId = temasId
    this.#_isAnswerOnId = isAnswerOnId
    this.#_filesId = filesId

    this.Author = this.docs.buffer.currentPositions.indexed[authorId]
    this.Type = this.docs.buffer.types.indexed[typeId]
    this.State = this.docs.buffer.states.indexed[stateId]

    const addarr = []
    addresseesId.forEach((el) => {
      addarr.push(this.docs.buffer.extCurrentPositions.indexed[el])
    })
    this.Addressees = addarr

    const podarr = []
    podpisantsId.forEach((el) => {
      podarr.push(this.docs.buffer.currentPositions.indexed[el])
    })
    this.Podpisants = podarr

    const temarr = []
    temasId.forEach((el) => {
      temarr.push(this.docs.buffer.temas.indexed[el])
    })
    this.Temas = temarr

    const answarr = []
    isAnswerOnId.forEach((el) => {
      answarr.push(this.docs.buffer.extIncomings.indexed[el])
    })
    this.IsAnswerOn = answarr

    const filearr = []
    filesId.forEach((el) => {
      filearr.push(this.docs.buffer.extOutFiles.indexed[el])
    })
    this.Files = filearr
  }

  get authorId () {
    return this.#_authorId
  }

  set authorId (newVal) {
    if (typeof newVal === 'string') {
      this.#_authorId = newVal
      this.Author = this.docs.buffer.currentPositions.indexed[this.#_authorId]
    }
  }

  get typeId () {
    return this.#_typeId
  }

  set typeId (newVal) {
    if (typeof newVal === 'string') {
      this.#_typeId = newVal
      this.Type = this.docs.buffer.types.indexed[this.#_typeId]
    }
  }

  get stateId () {
    return this.#_stateId
  }

  set stateId (newVal) {
    if (typeof newVal === 'string') {
      this.#_stateId = newVal
      this.State = this.docs.buffer.states.indexed[this.#_stateId]
    }
  }

  get addresseesId () {
    return this.#_addresseesId
  }

  set addresseesId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_addresseesId = newVal
      const arr = []
      this.#_addresseesId.forEach((el) => {
        const addressee = this.docs.buffer.extCurrentPositions.indexed[el]
        if (addressee.isValid) { arr.push(addressee) }
      })
      this.Addressees = arr
    }
  }

  get podpisantsId () {
    return this.#_podpisantsId
  }

  set podpisantsId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_podpisantsId = newVal
      const arr = []
      this.#_podpisantsId.forEach((el) => {
        const podpisant = this.docs.buffer.currentPositions.indexed[el]
        if (podpisant.isValid) { arr.push(podpisant) }
      })
      this.Podpisants = arr
    }
  }

  get temasId () {
    return this.#_temasId
  }

  set temasId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_temasId = newVal
      const temas = []
      this.#_temasId.forEach((el) => {
        const tema = this.docs.buffer.temas.indexed[el]
        if (tema.isValid) { temas.push(tema) }
      })
      this.Temas = temas
    }
  }

  get isAnswerOnId () {
    return this.#_isAnswerOnId
  }

  set isAnswerOnId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_isAnswerOnId = newVal
      const arr = []
      this.#_isAnswerOnId.forEach((el) => {
        const answer = this.docs.buffer.extIncomings.indexed[el]
        if (answer.isValid) { arr.push(answer) }
      })
      this.IsAnswerOn = arr
    }
  }

  get filesId () {
    return this.#_filesId
  }

  set filesId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_filesId = newVal
      const arr = []
      this.#_filesId.forEach((el) => {
        const file = this.docs.buffer.extOutFiles.indexed[el]
        if (file.isValid) { arr.push(file) }
      })
      this.Files = arr
    }
  }

  get Organisations () {
    const orgs = []
    this.Addressees.forEach((el) => {
      orgs.push(el.Organisation)
    })
    return orgs
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtOutgoing(obj)
  }
}

export function formExtOutgoings (element) {
  return new ExtOutgoing(element)
}

export function sortExtOutgoings () {
  return {
    dateIsh: 1,
    outNumber: 1
  }
}

export async function addExtOutgoing (instance, arr) {
  await common.addElements(instance, [
    { storage: 'extOutgoings', items: arr.ExtOutgoing },
    { storage: 'extOutFiles', items: arr.ExtOutFiles }
  ])
}

export async function editExtOutgoing (instance, item) {
  const storage = await common.getStorage(instance)
  const editableItem = storage.extOutgoings.indexed[item.id]
  if (editableItem.isValid) {
    editableItem.subject = item.subject
    editableItem.outNumber = item.outNumber
    editableItem.outDate = item.outDate
    editableItem.prefix = item.prefix
    editableItem.updatedAt = item.updatedAt
    editableItem.authorId = item.authorId
    editableItem.typeId = item.typeId
    editableItem.stateId = item.stateId
    editableItem.addresseesId = item.addresseesId
    editableItem.podpisantsId = item.podpisantsId
    editableItem.temasId = item.temasId
    editableItem.isAnswerOnId = item.isAnswerOnId
    editableItem.note = item.note
    editableItem.filesId = item.filesId
  }
}

export async function editExtOutgoings (instance, arr) {
  const storage = await common.getStorage(instance)
  const editedItem = storage.extOutgoings.indexed[arr.ExtOutgoing.id]
  if (!editedItem.isValid) { return }
  await storage.extOutgoings.edit(arr.ExtOutgoing.id, arr.ExtOutgoing)
  await common.manageElements(instance, 'extOutFiles', common.getItemToAddEditDelete({
    storage,
    storageName: 'extOutFiles',
    idPropName: 'ExtOutgoingId',
    ExtOutgoingId: arr.ExtOutgoing.id,
    array: arr.ExtOutFiles
  }))
  await storage.extOutgoings.update(arr.ExtOutgoing.id)
}

async function deleteRelEntitys (storage, entity, fieldName, id) {
  const doc = storage.extOutgoings.indexed[id]
  const itemsToDelete = doc[fieldName]
  await storage[entity].deleteItem(itemsToDelete)
}

export async function deleteExtOutgoings (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    await deleteRelEntitys(storage, 'extOutFiles', 'filesId', id)
  }
  storage.extOutgoings.delete(itemsId)
}
