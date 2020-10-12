// ----------- Поля IntIncomings
// --Из базы:
// id
// subject
// extNumber
// extDate
// extNumberPrefix
// needAnswer
// type
// typeId
// state
// stateId
// incNumber
// incNumberDigit
// incDate
// incNumberId
// temas
// temasId
// author
// authorId
// podpisants
// podpisantsId
// addressee
// addresseeId
// IntIncDepData {
//   DepartmentId
//   state {
//     IntIncStateId
//     StateId
//     StateName
//   }
//   incNumber {
//     IntIncNumberId
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
// answers
// answersId
// sourceOutgoing
// sourceOutgoingId
// resolutions
// Files
// FilesId
// ------------------------------------------------------------------------------------------------------
// --Заимствуются:
//
//  id
//  subject
//  extNumber
//  extDate
//  extNumberPrefix
//  needAnswer
//  updatedAt
//  IntIncDepData
//
// --Заимствуются с сеттерами:
//
//  typeId
//  stateId
//  incNumberId
//  temasId
//  authorId
//  podpisantsId
//  addresseesId
//  notes
//  answersId
//  sourceOutgoingId
//  resolutions
//  filesId
//
// --Вычисляемые:
//
//  extNumberWithPrefix
//  type
//  state
//  incNumber
//  incNumberDigit
//  incDate
//  author
//  answers
//  podpisants
//  addressees
//  dateVx
//  dateIsh
//
// --Ссылки:
//
//  Type
//  Temas
//  Author
//  Podpisants
//  Addressees
//  IntIncStates
//  IncNumbers
//  Answers
//  SourceOutgoing
//  Resolutions
//  Files
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- IntIncomings ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
import moment from 'moment'
import { dateConvert } from '@/utils/date.js'
import { NullType } from '@/Storage/ent-methods/types'
import { NullCurrentPosition } from '@/Storage/ent-methods/current-positions'
import { NullIntOutgoing } from '@/Storage/ent-methods/int-outgoings'
import * as common from './common'

export class NullIntIncoming extends common.Entity {
  #_typeId
  #_temasId
  #_authorId
  #_podpisantsId
  #_addresseesId
  #_notes
  #_answersId
  #_sourceOutgoingId
  #_resolutions
  #_filesId

  constructor () {
    super()
    this.id = -1
    this.subject = ''
    this.extNumber = ''
    this.extDate = ''
    this.extNumberPrefix = ''
    this.needAnswer = false
    this.IntIncDepData = []
    this.updatedAt = ''

    this.#_typeId = -1
    this.#_authorId = -1
    this.#_temasId = []
    this.#_podpisantsId = []
    this.#_addresseesId = []
    this.#_notes = []
    this.#_answersId = []
    this.#_sourceOutgoingId = -1
    this.#_resolutions = []
    this.#_filesId = []

    this.Type = new NullType()
    this.Temas = []
    this.Author = new NullCurrentPosition()
    this.Podpisants = []
    this.Addressees = []
    this.Answers = []
    this.SourceOutgoing = new NullIntOutgoing()
    this.Resolutions = []
    this.Files = []
  }

  get IntIncStates () {
    const statearr = []
    this.IntIncDepData.forEach((el) => {
      if (el.state) {
        const state = this.docs.buffer.intIncStates.indexed[el.state.IntIncStateId]
        if (state?.isValid) { statearr.push(state) }
      }
    })
    return statearr
  }

  get IncNumbers () {
    const incNumarr = []
    this.IntIncDepData.forEach((el) => {
      if (el.incNumber) {
        const incNumber = this.docs.buffer.intIncNumbers.indexed[el.incNumber.IntIncNumberId]
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

  get podpisantsId () {
    return this.#_podpisantsId
  }

  get addresseesId () {
    return this.#_addresseesId
  }

  get notes () {
    return this.#_notes
  }

  get answersId () {
    return this.#_answersId
  }

  get sourceOutgoingId () {
    return this.#_sourceOutgoingId
  }

  get resolutions () {
    return this.#_resolutions
  }

  get filesId () {
    return this.#_filesId
  }

  get extNumberWithPrefix () {
    return (this.extNumberPrefix || '') + (this.extNumber || '')
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

  get incNumberDigit () {
    return null
  }

  get incDate () {
    return null
  }

  get author () {
    return this.Author.posName
  }

  get answers () {
    const arr = []
    if (this.Answers.length) {
      this.Answers.forEach((el) => {
        arr.push(`Исх. от ${el.outDate || ''} №${el.outNumber || ''}`)
      })
    }
    return arr
  }

  get podpisants () {
    const arr = []
    this.Podpisants.forEach((el) => {
      arr.push(el.posName)
    })
    return arr.join('\n')
  }

  get addressees () {
    const arr = []
    this.Addressees.forEach((el) => {
      arr.push(el.posName)
    })
    return arr.join('\n')
  }

  get dateVx () {
    return this.incDate ? +moment(dateConvert(this.incDate)) : ''
  }

  get dateIsh () {
    return this.extDate ? +moment(dateConvert(this.extDate)) : ''
  }

  toJSON () {
    return {
      id: this.id,
      subject: this.subject,
      extNumber: this.extNumber,
      extDate: this.extDate,
      extNumberPrefix: this.extNumberPrefix,
      needAnswer: this.needAnswer,
      IntIncDepData: this.IntIncDepData,
      typeId: this.typeId,
      stateId: this.stateId,
      temasId: this.temasId,
      authorId: this.authorId,
      podpisantsId: this.podpisantsId,
      addresseeId: this.addresseesId,
      notes: this.notes,
      answersId: this.answersId,
      sourceOutgoingId: this.sourceOutgoingId,
      resolutions: this.resolutions,
      FilesId: this.filesId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullIntIncoming()
  }
}

export class IntIncoming extends NullIntIncoming {
  #_typeId
  #_temasId
  #_authorId
  #_podpisantsId
  #_addresseesId
  #_notes
  #_answersId
  #_sourceOutgoingId
  #_resolutions
  #_filesId

  constructor ({
    id = '',
    subject = '',
    extNumber = '',
    extDate = new Date().toISOString().substr(0, 10),
    extNumberPrefix = '',
    needAnswer = false,
    IntIncDepData = [],
    updatedAt = new Date().toISOString().substr(0, 10),
    typeId = '',
    authorId = '',
    temasId = [],
    podpisantsId = [],
    addresseeId = [],
    notes = [],
    answersId = [],
    sourceOutgoingId = '',
    resolutions = [],
    FilesId = []
  } = {}) {
    super()
    this.id = id
    this.subject = subject
    this.extNumber = extNumber
    this.extDate = extDate
    this.extNumberPrefix = extNumberPrefix
    this.needAnswer = needAnswer
    this.IntIncDepData = IntIncDepData
    this.updatedAt = updatedAt

    this.#_typeId = typeId
    this.#_authorId = authorId
    this.#_podpisantsId = podpisantsId
    this.#_addresseesId = addresseeId
    this.#_notes = notes
    this.#_answersId = answersId
    this.#_temasId = temasId
    this.#_sourceOutgoingId = sourceOutgoingId
    this.#_resolutions = resolutions
    this.#_filesId = FilesId

    this.Type = this.docs.buffer.types.indexed[typeId]

    const temarr = []
    temasId.forEach((el) => {
      temarr.push(this.docs.buffer.temas.indexed[el])
    })
    this.Temas = temarr

    this.Author = this.docs.buffer.currentPositions.indexed[authorId]

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

    const answarr = []
    answersId.forEach((el) => {
      answarr.push(this.docs.buffer.intOutgoings.indexed[el])
    })
    this.Answers = answarr

    this.SourceOutgoing = this.docs.buffer.intOutgoings.indexed[sourceOutgoingId]

    const resarr = []
    resolutions.forEach((el) => {
      resarr.push(this.docs.buffer.resolutions.indexed[el])
    })
    this.Resolutions = resarr

    const filearr = []
    FilesId.forEach((el) => {
      filearr.push(this.docs.buffer.intIncFiles.indexed[el])
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
      const selectedDepData = this.IntIncDepData.find(el => el.DepartmentId === selectedDep)
      if (newVal === '') {
        if (selectedDepData.state) {
          delete selectedDepData.incNumber
        } else {
          const index = this.IntIncDepData.indexOf(selectedDepData)
          delete this.IntIncDepData[index]
        }
      } else {
        const newIncNum = this.docs.buffer.intIncNumbers.indexed[newVal]
        if (newIncNum.isValid) {
          if (selectedDepData) {
            selectedDepData.incNumber = {
              IntIncNumberId: newIncNum.id,
              incNumberDigit: newIncNum.incNumber,
              incDate: newIncNum.incDate,
              prefix: newIncNum.prefix
            }
          } else {
            this.IntIncDepData.push({
              DepartmentId: selectedDep,
              incNumber: {
                IntIncNumberId: newIncNum.id,
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
    if (!this.IntIncStates) { return null }
    const state = this.IntIncStates.find(el => el.DepartmentId === selectedDep)
    if (state) {
      return state.id
    } else {
      return null
    }
  }

  set stateId (newVal) {
    if (typeof newVal === 'string') {
      const selectedDep = common.getSelectedDep()
      const selectedDepData = this.IntIncDepData.find(el => el.DepartmentId === selectedDep)
      const newState = this.docs.buffer.intIncStates.indexed[newVal]
      if (newState.isValid) {
        if (selectedDepData) {
          selectedDepData.state = {
            IntIncStateId: newState.id,
            StateId: newState.StateId,
            StateName: this.docs.buffer.states.indexed[newState.StateId].name
          }
        } else {
          this.IntIncDepData.push({
            DepartmentId: selectedDep,
            state: {
              IntIncStateId: newState.id,
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

  get answersId () {
    return this.#_answersId
  }

  set answersId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_answersId = newVal
      const arr = []
      this.#_answersId.forEach((el) => {
        const answer = this.docs.buffer.intOutgoings.indexed[el]
        if (answer.isValid) { arr.push(answer) }
      })
      this.Answers = arr
    }
  }

  get sourceOutgoingId () {
    return this.#_sourceOutgoingId
  }

  set sourceOutgoingId (newVal) {
    if (typeof newVal === 'string') {
      this.#_sourceOutgoingId = newVal
      this.SourceOutgoing = this.docs.buffer.intOutgoings.indexed[this.#_sourceOutgoingId]
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
        const file = this.docs.buffer.intIncFiles.indexed[el]
        if (file.isValid) { arr.push(file) }
      })
      this.Files = arr
    }
  }

  get state () {
    const selectedDep = common.getSelectedDep()
    if (!this.IntIncStates) { return null }
    const intState = this.IntIncStates.find(el => el.DepartmentId === selectedDep)
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

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new IntIncoming(obj)
  }
}

export function formIntIncomings (element) {
  return new IntIncoming(element)
}

export function sortIntIncomings () {
  return {
    dateVx: 1,
    incNumber: 1
  }
}

export async function addIntIncoming (instance, arr) {
  await common.addElements(instance, [
    { storage: 'intIncomings', items: arr.IntIncoming },
    { storage: 'intIncNumbers', items: arr.IncNumbers },
    { storage: 'intIncStates', items: arr.IntIncStates },
    { storage: 'intIncFiles', items: arr.IntIncFiles },
    { storage: 'resolutions', items: arr.Resolutions }
  ])
}

export async function editIntIncoming (instance, item) {
  const storage = await common.getStorage(instance)
  const editableItem = storage.intIncomings.indexed[item.id]
  if (!editableItem.isValid) { return }
  editableItem.subject = item.subject
  editableItem.extNumber = item.extNumber
  editableItem.extDate = item.extDate
  editableItem.extNumberPrefix = item.extNumberPrefix
  editableItem.needAnswer = item.needAnswer
  editableItem.updatedAt = item.updatedAt
  editableItem.IntIncDepData = item.IntIncDepData
  editableItem.typeId = item.typeId
  editableItem.temasId = item.temasId
  editableItem.authorId = item.authorId
  editableItem.podpisantsId = item.podpisantsId
  editableItem.addresseesId = item.addresseesId || item.addresseeId
  editableItem.notes = item.notes
  editableItem.answersId = item.answersId
  editableItem.sourceOutgoingId = item.sourceOutgoingId || item.AnswersId
  editableItem.resolutions = item.resolutions
  editableItem.filesId = item.filesId || item.FilesId
}

export async function editIntIncomings (instance, arr) {
  console.log('Редактирование IntIncoming:', arr)
  const storage = await common.getStorage(instance)
  const editedItem = storage.intIncomings.indexed[arr.IntIncoming.id]
  if (!editedItem.isValid) { return }
  await storage.intIncomings.edit(arr.IntIncoming.id, arr.IntIncoming)
  await common.manageElements(instance, 'intIncNumbers', common.getItemToAddEditDelete({
    storage,
    storageName: 'intIncNumbers',
    idPropName: 'IntIncomingId',
    IntIncomingId: arr.IntIncoming.id,
    array: arr.IncNumbers
  }))

  await common.manageElements(instance, 'intIncStates', common.getItemToAddEditDelete({
    storage,
    storageName: 'intIncStates',
    idPropName: 'IntIncomingId',
    IntIncomingId: arr.IntIncoming.id,
    array: arr.IntIncStates
  }))

  await common.manageElements(instance, 'intIncFiles', common.getItemToAddEditDelete({
    storage,
    storageName: 'intIncFiles',
    idPropName: 'IntIncomingId',
    IntIncomingId: arr.IntIncoming.id,
    array: arr.IntIncFiles
  }))

  await common.manageElements(instance, 'resolutions', common.getItemToAddEditDelete({
    storage,
    storageName: 'resolutions',
    idPropName: 'intIncoming',
    intIncoming: arr.IntIncoming.id,
    array: arr.Resolutions
  }))
  await storage.intIncomings.update(arr.IntIncoming.id)
  await storage.types.updateAll()
  await storage.states.updateAll()
}

async function deleteRelEntitys (storage, entity, fieldName, id) {
  const doc = storage.intIncomings.indexed[id]
  if (!doc.isValid) { return }
  const itemsToDelete = doc[fieldName]
  await storage[entity].deleteItem(itemsToDelete)
}

function getStatesAndNumbersToDelete (storage, id) {
  const doc = storage.intIncomings.indexed[id]
  if (!doc.isValid) { return }
  const statearr = []
  const incNumarr = []
  doc.IntIncDepData.forEach((el) => {
    if (el.state) {
      const state = storage.intIncStates.indexed[el.state.IntIncStateId]
      if (state.isValid) { statearr.push(state.id) }
    }
    if (el.incNumber) {
      const incNumber = storage.intIncNumbers.indexed[el.incNumber.IntIncNumberId]
      if (incNumber.isValid) { incNumarr.push(incNumber.id) }
    }
  })
  return { statearr, incNumarr }
}

export async function deleteIntIncomings (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    const { statearr, incNumarr } = getStatesAndNumbersToDelete(storage, id)
    await Promise.all([
      storage.intIncStates.deleteItem(statearr),
      storage.incNumbers.deleteItem(incNumarr),
      deleteRelEntitys(storage, 'extIncFiles', 'filesId', id),
      deleteRelEntitys(storage, 'resolutions', 'resolutions', id)
    ])
  }
  await storage.intIncomings.delete(itemsId)
}
