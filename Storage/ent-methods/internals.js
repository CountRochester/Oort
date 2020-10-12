// ----------- Поля Internals
// --Из базы:
// id
// incNumber
// incDate
// incNumberId
// incNumberDigit
// subject
// docNumber
// docDate
// docNumberPrefix
// type
// typeId
// temas
// temasId
// state
// stateId
// author
// authorId
// InternalDepData {
//   DepartmentId
//   state {
//     InternalStateId
//     StateId
//     StateName
//   }
//   incNumber {
//     InternalIncNumberId
//     incNumberDigit
//     incDate
//     prefix
//   }
// }
// notes {
//   id
//   DepartmentId
//   text
// }
// podpisants
// podpisantsId
// addressee
// addresseeId
// resolutions
// Files
// FilesId
// updatedAt
//
// ------------------------------------------------------------------------------------------------------
// --Заимствуются:
//
//  id
//  subject
//  docNumber
//  docDate
//  docNumberPrefix
//  updatedAt
//  InternalDepData
//
// --Заимствуются с сеттерами:
//
//  typeId
//  incNumberId   !!
//  stateId       !!
//  temasId
//  authorId
//  notes
//  podpisantsId
//  addresseesId
//  resolutions
//  filesId
//
// --Вычисляемые:
//
//  docNumberWithPrefix
//  type
//  state
//  incNumber
//  incDate
//  incNumberDigit
//  temas
//  author
//  podpisants
//  addressees
//  files
//  dateVx
//  dateDoc
//
// --Ссылки:
//
//  Type
//  Temas
//  Author
//  Podpisants
//  Addressees
//  InternalStates
//  IncNumbers
//  Resolutions
//  Files
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- Internals ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import moment from 'moment'
import { dateConvert } from '@/utils/date.js'
import { NullType } from '@/Storage/ent-methods/types'
import { NullCurrentPosition } from '@/Storage/ent-methods/current-positions'
import * as common from './common'

export class NullInternal extends common.Entity {
  #_typeId
  #_temasId
  #_authorId
  #_notes
  #_podpisantsId
  #_addresseesId
  #_resolutions
  #_filesId
  constructor () {
    super()
    this.id = -1
    this.subject = ''
    this.docNumber = ''
    this.docDate = ''
    this.docNumberPrefix = ''
    this.updatedAt = ''
    this.InternalDepData = []
    this.#_typeId = -1
    this.#_temasId = []
    this.#_authorId = -1
    this.#_notes = []
    this.#_podpisantsId = []
    this.#_addresseesId = []
    this.#_resolutions = []
    this.#_filesId = []

    this.Type = new NullType()
    this.Temas = []
    this.Author = new NullCurrentPosition()
    this.Podpisants = []
    this.Addressees = []
    this.Resolutions = []
    this.Files = []
  }

  get InternalStates () {
    const statearr = []
    this.InternalDepData.forEach((el) => {
      if (el.state) {
        const state = this.docs.buffer.internalIncStates.indexed[el.state.InternalStateId]
        if (state?.isValid) { statearr.push(state) }
      }
    })
    return statearr
  }

  get IncNumbers () {
    const incNumarr = []
    this.InternalDepData.forEach((el) => {
      if (el.incNumber) {
        const incNumber = this.docs.buffer.internalIncNumbers.indexed[el.incNumber.InternalIncNumberId]
        if (incNumber?.isValid) { incNumarr.push(incNumber) }
      }
    })
    return incNumarr
  }

  get typeId () {
    return this.#_typeId
  }

  get incNumberId () {
    return null
  }

  get stateId () {
    return null
  }

  get temasId () {
    return this.#_temasId
  }

  get authorId () {
    return this.#_authorId
  }

  get notes () {
    return this.#_notes
  }

  get podpisantsId () {
    return this.#_podpisantsId
  }

  get addresseesId () {
    return this.#_addresseesId
  }

  get resolutions () {
    return this.#_resolutions
  }

  get filesId () {
    return this.#_filesId
  }

  get docNumberWithPrefix () {
    return (this.docNumberPrefix || '') + (this.docNumber || '')
  }

  get type () {
    return this.Type.name
  }

  get state () {
    return null
  }

  get incNumber () {
    return null
  }

  get incDate () {
    return null
  }

  get incNumberDigit () {
    return null
  }

  get temas () {
    const output = []
    this.Temas.forEach((el) => { output.push(el.name) })
    return output.join('\n')
  }

  get author () {
    return this.Author.posName
  }

  get podpisants () {
    const output = []
    this.Podpisants.forEach((el) => { output.push(el.posName) })
    return output.join('\n')
  }

  get addressees () {
    const output = []
    this.Addressees.forEach((el) => { output.push(el.posName) })
    return output.join('\n')
  }

  get files () {
    const arr = []
    this.Files.forEach((el) => {
      arr.push(el.file)
    })
    return arr
  }

  get dateVx () {
    return this.incDate ? +moment(dateConvert(this.incDate)) : ''
  }

  get dateDoc () {
    return this.docDate ? +moment(dateConvert(this.docDate)) : ''
  }

  toJSON () {
    return {
      id: this.id,
      subject: this.subject,
      docNumber: this.docNumber,
      docDate: this.docDate,
      docNumberPrefix: this.docNumberPrefix,
      InternalDepData: this.InternalDepData,
      typeId: this.typeId,
      stateId: this.stateId,
      temasId: this.temasId,
      authorId: this.authorId,
      podpisantsId: this.podpisantsId,
      addresseeId: this.addresseesId,
      notes: this.notes,
      resolutions: this.resolutions,
      FilesId: this.filesId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullInternal()
  }
}

export class Internal extends NullInternal {
  #_typeId
  #_temasId
  #_authorId
  #_notes
  #_podpisantsId
  #_addresseesId
  #_resolutions
  #_filesId
  constructor ({
    id = '',
    subject = '',
    docNumber = '',
    docDate = new Date().toISOString().substr(0, 10),
    docNumberPrefix = '',
    updatedAt = new Date().toISOString().substr(0, 10),
    InternalDepData = [],
    typeId = '',
    temasId = [],
    authorId = '',
    notes = [],
    podpisantsId = [],
    addresseeId = [],
    resolutions = [],
    FilesId = []
  } = {}) {
    super()
    this.id = id
    this.subject = subject
    this.docNumber = docNumber
    this.docDate = docDate
    this.docNumberPrefix = docNumberPrefix
    this.updatedAt = updatedAt
    this.InternalDepData = InternalDepData
    this.#_typeId = typeId
    this.#_temasId = temasId
    this.#_authorId = authorId
    this.#_notes = notes
    this.#_podpisantsId = podpisantsId
    this.#_addresseesId = addresseeId
    this.#_resolutions = resolutions
    this.#_filesId = FilesId

    this.Type = this.docs.buffer.types.indexed[typeId] || new NullType()

    const temarr = []
    temasId.forEach((el) => {
      temarr.push(this.docs.buffer.temas.indexed[el])
    })
    this.Temas = temarr

    this.Author = this.docs.buffer.currentPositions.indexed[authorId] || new NullCurrentPosition()

    const podarr = []
    podpisantsId.forEach((el) => {
      podarr.push(this.docs.buffer.currentPositions.indexed[el])
    })
    this.Podpisants = podarr

    const addarr = []
    addresseeId.forEach((el) => {
      addarr.push(this.docs.buffer.currentPositions.indexed[el])
    })
    this.Addressees = addarr

    const resarr = []
    resolutions.forEach((el) => {
      resarr.push(this.docs.buffer.resolutions.indexed[el])
    })
    this.Resolutions = resarr

    const filearr = []
    FilesId.forEach((el) => {
      filearr.push(this.docs.buffer.internalFiles.indexed[el])
    })
    this.Files = filearr
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

  get incNumberId () {
    const selectedDep = common.getSelectedDep()
    if (!this.IncNumbers) { return null }
    const incNum = this.IncNumbers.find(el => el.DepartmentId === selectedDep)
    if (incNum) {
      return incNum.id
    } else {
      return null
    }
  }

  set incNumberId (newVal) {
    if (typeof newVal === 'string') {
      const selectedDep = common.getSelectedDep()
      const selectedDepData = this.InternalDepData.find(el => el.DepartmentId === selectedDep)
      if (newVal === '') {
        if (selectedDepData.state) {
          delete selectedDepData.incNumber
        } else {
          const index = this.InternalDepData.indexOf(selectedDepData)
          delete this.InternalDepData[index]
        }
      } else {
        const newIncNum = this.docs.buffer.internalIncNumbers.indexed[newVal]
        if (newIncNum.isValid) {
          if (selectedDepData) {
            selectedDepData.incNumber = {
              InternalIncNumberId: newIncNum.id,
              incNumberDigit: newIncNum.incNumber,
              incDate: newIncNum.incDate,
              prefix: newIncNum.prefix
            }
          } else {
            this.InternalDepData.push({
              DepartmentId: selectedDep,
              incNumber: {
                InternalIncNumberId: newIncNum.id,
                incNumberDigit: newIncNum.incNumber,
                incDate: newIncNum.incDate,
                prefix: newIncNum.prefix
              }
            })
          }
        }
      }
    }
  }

  get stateId () {
    const selectedDep = common.getSelectedDep()
    if (!this.InternalStates) { return null }
    const state = this.InternalStates.find(el => el.DepartmentId === selectedDep)
    if (state) {
      return state.id
    } else {
      return null
    }
  }

  set stateId (newVal) {
    // if (typeof newVal === 'string') {
    //   const selectedDep = common.getSelectedDep()
    //   const states = this.InternalStates.filter(el => el.DepartmentId !== selectedDep) || []
    //   const newState = this.docs.buffer.internalIncStates.indexed[newVal]
    //   if (newState) {
    //     states.push(newState)
    //     this.InternalStates = states
    //   }
    // }
    if (typeof newVal === 'string') {
      const selectedDep = common.getSelectedDep()
      const selectedDepData = this.InternalDepData.find(el => el.DepartmentId === selectedDep)
      const newState = this.docs.buffer.internalIncStates.indexed[newVal]
      if (newState.isValid) {
        if (selectedDepData) {
          selectedDepData.state = {
            InternalStateId: newState.id,
            StateId: newState.StateId,
            StateName: this.docs.buffer.states.indexed[newState.StateId].name
          }
        } else {
          this.InternalDepData.push({
            DepartmentId: selectedDep,
            state: {
              InternalStateId: newState.id,
              StateId: newState.StateId,
              StateName: this.docs.buffer.states.indexed[newState.StateId].name
            }
          })
        }
      }
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

  get authorId () {
    return this.#_authorId
  }

  set authorId (newVal) {
    if (typeof newVal === 'string') {
      this.#_authorId = newVal
      this.Author = this.docs.buffer.currentPositions.indexed[this.#_authorId]
    }
  }

  get notes () {
    return this.#_notes
  }

  set notes (newVal) {
    if (typeof newVal === 'string') {
      const selectedDep = common.getSelectedDep()
      const note = this.#_notes.find(el => el.DepartmentId === selectedDep)
      if (note) {
        note.text = newVal
      } else {
        this.#_notes.push({
          id: null,
          DepartmentId: selectedDep,
          text: newVal
        })
      }
    } else if (Object.prototype.toString.call(newVal) === '[object Object]') {
      const selectedDep = common.getSelectedDep()
      const note = this.#_notes.find(el => el.DepartmentId === selectedDep)
      if (note) {
        note.text = newVal.text
        note.id = newVal.id
      } else {
        this.#_notes.push({
          id: newVal.id,
          DepartmentId: selectedDep,
          text: newVal.text
        })
      }
    } else if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_notes = newVal
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

  get addresseesId () {
    return this.#_addresseesId
  }

  set addresseesId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_addresseesId = newVal
      const arr = []
      this.#_addresseesId.forEach((el) => {
        const addressee = this.docs.buffer.currentPositions.indexed[el]
        if (addressee.isValid) { arr.push(addressee) }
      })
      this.Addressees = arr
    }
  }

  get resolutions () {
    return this.#_resolutions
  }

  set resolutions (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_resolutions = newVal
      const arr = []
      this.#_resolutions.forEach((el) => {
        const resolution = this.docs.buffer.resolutions.indexed[el]
        if (resolution.isValid) { arr.push(resolution) }
      })
      this.Resolutions = arr
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
        const file = this.docs.buffer.internalFiles.indexed[el]
        if (file.isValid) { arr.push(file) }
      })
      this.Files = arr
    }
  }

  get state () {
    const selectedDep = common.getSelectedDep()
    if (!this.InternalStates) { return null }
    const intState = this.InternalStates.find(el => el.DepartmentId === selectedDep)
    if (intState) {
      const state = this.docs.buffer.states.indexed[intState.StateId]
      if (state.isValid) {
        return state.name
      } else {
        return 'Неизвестное состояние'
      }
    } else {
      return null
    }
  }

  get incNumber () {
    const selectedDep = common.getSelectedDep()
    if (!this.IncNumbers) { return null }
    const incNum = this.IncNumbers.find(el => el.DepartmentId === selectedDep)
    if (incNum) {
      return (incNum.prefix || '') + (incNum.incNumber || '')
    } else {
      return null
    }
  }

  get incDate () {
    const selectedDep = common.getSelectedDep()
    if (!this.IncNumbers) { return null }
    const incNum = this.IncNumbers.find(el => el.DepartmentId === selectedDep)
    if (incNum) {
      return incNum.incDate || ''
    } else {
      return null
    }
  }

  get incNumberDigit () {
    const selectedDep = common.getSelectedDep()
    if (!this.IncNumbers) { return null }
    const incNum = this.IncNumbers.find(el => el.DepartmentId === selectedDep)
    if (incNum) {
      return incNum.incNumber || ''
    } else {
      return null
    }
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new Internal(obj)
  }
}

export function formInternals (element) {
  return new Internal(element)
}

export function sortInternals () {
  return {
    incDate: 1
  }
}

export async function addInternal (instance, arr) {
  await common.addElements(instance, [
    { storage: 'internals', items: arr.Internal },
    { storage: 'internalIncNumbers', items: arr.IncNumbers },
    { storage: 'internalIncStates', items: arr.InternalStates },
    { storage: 'internalFiles', items: arr.InternalFiles },
    { storage: 'resolutions', items: arr.Resolutions }
  ])
}

export async function editInternal (instance, item) {
  const storage = await common.getStorage(instance)
  const editableItem = storage.internals.indexed[item.id]
  if (!editableItem.isValid) { return }
  editableItem.subject = item.subject
  editableItem.docNumber = item.docNumber
  editableItem.docDate = item.docDate
  editableItem.docNumberPrefix = item.docNumberPrefix
  editableItem.updatedAt = item.updatedAt
  editableItem.InternalDepData = item.InternalDepData
  editableItem.typeId = item.typeId
  editableItem.temasId = item.temasId
  editableItem.authorId = item.authorId
  editableItem.podpisantsId = item.podpisantsId
  editableItem.addresseesId = item.addresseesId || item.addresseeId
  editableItem.resolutions = item.resolutions
  editableItem.notes = item.notes
  editableItem.filesId = item.filesId || item.FilesId
}

export async function editInternals (instance, arr) {
  const storage = await common.getStorage(instance)
  const editedItem = storage.internals.indexed[arr.Internal.id]
  if (!editedItem.isValid) { return }
  await storage.internals.edit(arr.Internal.id, arr.Internal)
  await common.manageElements(instance, 'internalIncNumbers', common.getItemToAddEditDelete({
    storage,
    storageName: 'internalIncNumbers',
    idPropName: 'InternalId',
    InternalId: arr.Internal.id,
    array: arr.IncNumbers
  }))

  await common.manageElements(instance, 'internalIncStates', common.getItemToAddEditDelete({
    storage,
    storageName: 'internalIncStates',
    idPropName: 'IntId',
    IntId: arr.Internal.id,
    array: arr.InternalStates
  }))

  await common.manageElements(instance, 'internalFiles', common.getItemToAddEditDelete({
    storage,
    storageName: 'internalFiles',
    idPropName: 'InternalId',
    InternalId: arr.Internal.id,
    array: arr.InternalFiles
  }))

  await common.manageElements(instance, 'resolutions', common.getItemToAddEditDelete({
    storage,
    storageName: 'resolutions',
    idPropName: 'internal',
    internal: arr.Internal.id,
    array: arr.Resolutions
  }))
  await storage.internals.update(arr.Internal.id)
  await storage.types.updateAll()
  await storage.states.updateAll()
}

async function deleteRelEntitys (storage, entity, fieldName, id) {
  const doc = storage.internals.indexed[id]
  if (!doc.isValid) { return }
  const itemsToDelete = doc[fieldName]
  await storage[entity].deleteItem(itemsToDelete)
}

function getStatesAndNumbersToDelete (storage, id) {
  const doc = storage.internals.indexed[id]
  if (!doc.isValid) { return }
  const statearr = []
  const incNumarr = []
  doc.InternalDepData.forEach((el) => {
    if (el.state) {
      const state = storage.internalIncStates.indexed[el.state.InternalStateId]
      if (state.isValid) { statearr.push(state.id) }
    }
    if (el.incNumber) {
      const incNumber = storage.internalIncNumbers.indexed[el.incNumber.InternalIncNumberId]
      if (incNumber.isValid) { incNumarr.push(incNumber.id) }
    }
  })
  return { statearr, incNumarr }
}

export async function deleteInternals (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    const { statearr, incNumarr } = getStatesAndNumbersToDelete(storage, id)
    await Promise.all([
      storage.internalIncStates.deleteItem(statearr),
      storage.internalIncNumbers.deleteItem(incNumarr),
      deleteRelEntitys(storage, 'internalFiles', 'filesId', id),
      deleteRelEntitys(storage, 'resolutions', 'resolutions', id)
    ])
  }
  storage.internals.delete(itemsId)
}
