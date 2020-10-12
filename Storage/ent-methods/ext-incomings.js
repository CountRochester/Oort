// ----------- Поля ExtIncomings
// --Из базы:
// id
// subject
// extNumber
// extDate
// needAnswer
// type
// TypeId
// state
// extIncStateId
// incNumber
// incNumberDigit
// incDate
// extIncNumberId
// ExtIncDepData {
//   DepartmentId
//   state {
//     ExtIncStateId
//     StateId
//     StateName
//   }
//   incNumber {
//     ExtIncNumberId
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
// temas
// temasId
// authors
// authorsId
// Organisation
// OrganisationId
// Executants
// ExecutantsId
// resolutions
// AnswersId
// Answers
// Files
// FilesId
// updatedAt
// ------------------------------------------------------------------------------------------------------
// --Заимствуются:
//
//  id
//  subject
//  extNumber
//  extDate
//  needAnswer
//  updatedAt
//  ExtIncDepData
//
// --Заимствуются с сеттерами:
//
//  typeId
//  stateId       !!
//  temasId
//  incNumberId   !!
//  authorsId
//  organisationsId
//  executantsId
//  resolutions
//  answersId
//  notes
//  filesId
//
// --Вычисляемые:
//
//  type
//  state
//  incNumber
//  incNumberDigit
//  incDate
//  incNumberPrefix
//  temas
//  authors
//  organisations
//  executants
//  answers
//  files
//  dateVx
//  dateIsh
//
// --Ссылки:
//
//  Type
//  Temas
//  Authors
//  ExtIncStates
//  IncNumbers
//  Organisations
//  Executants
//  Resolutions
//  Answers
//  Files
//
// ------------------------------------------------------------------------------------------------------
// ---------------------------------- ExtIncomings ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

import moment from 'moment'
import { dateConvert } from '@/utils/date.js'
import { NullType } from '@/Storage/ent-methods/types'
import * as common from './common'

export class NullExtIncoming extends common.Entity {
  #_typeId
  #_temasId
  #_authorsId
  #_executantsId
  #_resolutions
  #_answersId
  #_notes
  #_filesId

  constructor () {
    super()
    this.id = -1
    this.subject = ''
    this.extNumber = -1
    this.extDate = ''
    this.needAnswer = false
    this.updatedAt = ''
    this.ExtIncDepData = []

    this.#_typeId = -1
    this.#_temasId = []
    this.#_authorsId = []
    this.#_executantsId = []
    this.#_resolutions = []
    this.#_answersId = []
    this.#_notes = []
    this.#_filesId = []

    this.Type = new NullType()
    this.Temas = []
    this.Authors = []
    // this.ExtIncStates = []
    // this.IncNumbers = []
    this.Executants = []
    this.Resolutions = []
    this.Answers = []
    this.Files = []
  }

  get ExtIncStates () {
    const statearr = []
    this.ExtIncDepData.forEach((el) => {
      if (el.state) {
        const state = this.docs.buffer.extIncStates.indexed[el.state.ExtIncStateId]
        if (state?.isValid) { statearr.push(state) }
      }
    })
    return statearr
  }

  get IncNumbers () {
    const incNumarr = []
    this.ExtIncDepData.forEach((el) => {
      if (el.incNumber) {
        const incNumber = this.docs.buffer.incNumbers.indexed[el.incNumber.ExtIncNumberId]
        if (incNumber?.isValid) { incNumarr.push(incNumber) }
      }
    })
    return incNumarr
  }

  get typeId () {
    return this.#_typeId
  }

  get stateId () {
    return -1
  }

  get temasId () {
    return this.#_temasId
  }

  get incNumberId () {
    return -1
  }

  get authorsId () {
    return this.#_authorsId
  }

  get executantsId () {
    return this.#_executantsId
  }

  get resolutions () {
    return this.#_resolutions
  }

  get answersId () {
    return this.#_answersId
  }

  get notes () {
    return this.#_notes
  }

  get filesId () {
    return this.#_filesId
  }

  get Organisations () {
    return []
  }

  get type () {
    return this.Type.name
  }

  get state () {
    return 'Неизвестное состояние'
  }

  get depStateId () {
    return -1
  }

  get incNumber () {
    return null
  }

  get incNumberDigit () {
    return -1
  }

  get incDate () {
    return null
  }

  get incNumberPrefix () {
    return ''
  }

  get temas () {
    return ''
  }

  get authors () {
    return ''
  }

  get organisationsId () {
    return []
  }

  get organisations () {
    return ''
  }

  get executants () {
    return ''
  }

  get answers () {
    return []
  }

  get files () {
    return []
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
      needAnswer: this.needAnswer,
      TypeId: this.typeId,
      extIncStateId: this.stateId,
      extIncNumberId: this.incNumberId,
      ExtIncDepData: this.ExtIncDepData,
      temasId: this.temasId,
      authorsId: this.authorsId,
      OrganisationId: this.organisationsId,
      ExecutantsId: this.executantsId,
      notes: this.notes,
      AnswersId: this.answersId,
      resolutions: this.resolutions,
      FilesId: this.filesId,
      updatedAt: this.updatedAt
    }
  }

  clone () {
    return new NullExtIncoming()
  }
}

export class ExtIncoming extends NullExtIncoming {
  #_typeId
  #_temasId
  #_authorsId
  #_executantsId
  #_resolutions
  #_answersId
  #_notes
  #_filesId

  constructor ({
    id = '',
    subject = '',
    extNumber = '',
    extDate = new Date().toISOString().substr(0, 10),
    needAnswer = false,
    updatedAt = new Date().toISOString().substr(0, 10),
    ExtIncDepData = [],
    TypeId = '',
    temasId = [],
    authorsId = [],
    ExecutantsId = [],
    resolutions = [],
    AnswersId = [],
    notes = [],
    FilesId = []
  } = {}) {
    super()
    this.id = id
    this.subject = subject
    this.extNumber = extNumber
    this.extDate = extDate
    this.needAnswer = needAnswer
    this.updatedAt = updatedAt
    this.ExtIncDepData = ExtIncDepData

    this.#_typeId = TypeId
    this.#_temasId = temasId
    this.#_authorsId = authorsId
    this.#_executantsId = ExecutantsId
    this.#_resolutions = resolutions
    this.#_answersId = AnswersId
    this.#_notes = notes
    this.#_filesId = FilesId

    this.Type = this.docs.buffer.types.indexed[TypeId]
    const temarr = []
    temasId.forEach((el) => {
      temarr.push(this.docs.buffer.temas.indexed[el])
    })
    this.Temas = temarr

    const authArr = []
    authorsId.forEach((el) => {
      authArr.push(this.docs.buffer.extCurrentPositions.indexed[el])
    })
    this.Authors = authArr

    const execarr = []
    ExecutantsId.forEach((el) => {
      execarr.push(this.docs.buffer.currentPositions.indexed[el])
    })
    this.Executants = execarr

    const resarr = []
    resolutions.forEach((el) => {
      resarr.push(this.docs.buffer.resolutions.indexed[el])
    })
    this.Resolutions = resarr

    const answarr = []
    AnswersId.forEach((el) => {
      answarr.push(this.docs.buffer.extOutgoings.indexed[el])
    })
    this.Answers = answarr

    const filearr = []
    FilesId.forEach((el) => {
      filearr.push(this.docs.buffer.extIncFiles.indexed[el])
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

  get stateId () {
    const selectedDep = common.getSelectedDep()
    if (!this.ExtIncStates) { return null }
    const state = this.ExtIncStates.find(el => el.DepartmentId === selectedDep)
    if (state) {
      return state.id
    } else {
      return null
    }
  }

  set stateId (newVal) {
    // const selectedDep = common.getSelectedDep()
    // const states = this.ExtIncStates.filter(el => el.DepartmentId !== selectedDep) || []
    // const newState = this.docs.buffer.extIncStates.indexed[newVal]
    // if (newState.isValid) {
    //   states.push(newState)
    //   this.ExtIncStates = states
    // }
    if (typeof newVal === 'string') {
      const selectedDep = common.getSelectedDep()
      const selectedDepData = this.ExtIncDepData.find(el => el.DepartmentId === selectedDep)
      const newState = this.docs.buffer.extIncStates.indexed[newVal]
      if (newState.isValid) {
        if (selectedDepData) {
          selectedDepData.state = {
            ExtIncStateId: newState.id,
            StateId: newState.StateId,
            StateName: this.docs.buffer.states.indexed[newState.StateId].name
          }
        } else {
          this.ExtIncDepData.push({
            DepartmentId: selectedDep,
            state: {
              ExtIncStateId: newState.id,
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
      const selectedDepData = this.ExtIncDepData.find(el => el.DepartmentId === selectedDep)
      if (newVal === '') {
        if (selectedDepData.state) {
          delete selectedDepData.incNumber
        } else {
          const index = this.ExtIncDepData.indexOf(selectedDepData)
          delete this.ExtIncDepData[index]
        }
      } else {
        const newIncNum = this.docs.buffer.incNumbers.indexed[newVal]
        if (newIncNum.isValid) {
          if (selectedDepData) {
            selectedDepData.incNumber = {
              ExtIncNumberId: newIncNum.id,
              incNumberDigit: newIncNum.incNumber,
              incDate: newIncNum.incDate,
              prefix: newIncNum.prefix
            }
          } else {
            this.ExtIncDepData.push({
              DepartmentId: selectedDep,
              incNumber: {
                ExtIncNumberId: newIncNum.id,
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

  get authorsId () {
    return this.#_authorsId
  }

  set authorsId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_authorsId = newVal
      const authArr = []
      this.#_authorsId.forEach((el) => {
        const author = this.docs.buffer.extCurrentPositions.indexed[el]
        if (author.isValid) {
          authArr.push(author)
        }
      })
      this.Authors = authArr
    }
  }

  get executantsId () {
    return this.#_executantsId
  }

  set executantsId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_executantsId = newVal
      const arr = []
      this.#_executantsId.forEach((el) => {
        const executant = this.docs.buffer.currentPositions.indexed[el]
        if (executant.isValid) { arr.push(executant) }
      })
      this.Executants = arr
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

  get answersId () {
    return this.#_answersId
  }

  set answersId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_answersId = newVal
      const arr = []
      this.#_answersId.forEach((el) => {
        const answer = this.docs.buffer.extOutgoings.indexed[el]
        if (answer.isValid) { arr.push(answer) }
      })
      this.Answers = arr
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

  get filesId () {
    return this.#_filesId
  }

  set filesId (newVal) {
    if (Object.prototype.toString.call(newVal) === '[object Array]') {
      this.#_filesId = newVal
      const arr = []
      this.#_filesId.forEach((el) => {
        const file = this.docs.buffer.extIncFiles.indexed[el]
        if (file.isValid) { arr.push(file) }
      })
      this.Files = arr
    }
  }

  get Organisations () {
    const output = []
    this.Authors.forEach((el) => { output.push(el.Organisation) })
    return output
  }

  get type () {
    return this.Type.name
  }

  get state () {
    const selectedDep = common.getSelectedDep()
    if (!this.ExtIncStates) { return null }
    const intState = this.ExtIncStates.find(el => el.DepartmentId === selectedDep)
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

  get depStateId () {
    const selectedDep = common.getSelectedDep()
    if (!this.ExtIncStates) { return null }
    const intState = this.ExtIncStates.find(el => el.DepartmentId === selectedDep)
    if (intState) {
      const state = this.docs.buffer.states.indexed[intState.StateId]
      if (state.isValid) {
        return state.id
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

  get incNumberPrefix () {
    const selectedDep = common.getSelectedDep()
    if (!this.IncNumbers) { return null }
    const incNum = this.IncNumbers.find(el => el.DepartmentId === selectedDep)
    if (incNum) {
      return incNum.prefix || ''
    } else {
      return null
    }
  }

  get temas () {
    const output = []
    this.Temas.forEach((el) => {
      if (el) {
        output.push(el.name)
      }
    })
    return output.join('\n')
  }

  get authors () {
    const output = []
    this.Authors.forEach((el) => { output.push(el.posName) })
    return output.join('\n')
  }

  get organisationsId () {
    const output = []
    this.Organisations.forEach((el) => { output.push(el.id) })
    return output
  }

  get organisations () {
    const output = []
    this.Organisations.forEach((el) => { output.push(el.orgName) })
    return output.join('\n')
  }

  get executants () {
    const output = []
    this.Executants.forEach((el) => { output.push(el.posName) })
    return output.join('\n')
  }

  get answers () {
    const arr = []
    this.Answers.forEach((el) => {
      if (el) {
        arr.push(`Исх. от ${el.outDate || ''} №${el.prefix || ''}${el.outNumber || ''}`)
      }
    })
    return arr
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

  get dateIsh () {
    return this.extDate ? +moment(dateConvert(this.extDate)) : ''
  }

  clone () {
    const obj = JSON.parse(JSON.stringify(this.toJSON()))
    return new ExtIncoming(obj)
  }
}

export function formExtIncomings (element) {
  return new ExtIncoming(element)
}

export function sortExtIncomings () {
  return {
    dateVx: 1,
    incNumber: 1
  }
}

export async function addExtIncoming (instance, arr) {
  await common.addElements(instance, [
    { storage: 'extIncomings', items: arr.ExtIncoming },
    { storage: 'incNumbers', items: arr.IncNumbers },
    { storage: 'extIncStates', items: arr.ExtIncStates },
    { storage: 'extIncFiles', items: arr.ExtIncFiles },
    { storage: 'resolutions', items: arr.Resolutions }
  ])
}

export async function editExtIncoming (instance, item) {
  const storage = await common.getStorage(instance)
  const editableItem = storage.extIncomings.indexed[item.id]
  if (!editableItem.isValid) { return }
  editableItem.subject = item.subject
  editableItem.extNumber = item.extNumber
  editableItem.extDate = item.extDate
  editableItem.needAnswer = item.needAnswer
  editableItem.updatedAt = item.updatedAt
  editableItem.ExtIncDepData = item.ExtIncDepData

  editableItem.typeId = item.typeId || item.TypeId
  editableItem.temasId = item.temasId
  editableItem.authorsId = item.authorsId
  editableItem.executantsId = item.executantsId || item.ExecutantsId
  editableItem.resolutions = item.resolutions
  editableItem.answersId = item.answersId || item.AnswersId
  editableItem.notes = item.notes
  editableItem.filesId = item.filesId || item.FilesId
}

export async function editExtIncomings (instance, arr) {
  const storage = await common.getStorage(instance)
  const editedItem = storage.extIncomings.indexed[arr.ExtIncoming.id]
  if (!editedItem.isValid) { return }
  await storage.extIncomings.edit(arr.ExtIncoming.id, arr.ExtIncoming)
  await common.manageElements(instance, 'incNumbers', common.getItemToAddEditDelete({
    storage,
    storageName: 'incNumbers',
    idPropName: 'ExtIncomingId',
    ExtIncomingId: arr.ExtIncoming.id,
    array: arr.IncNumbers
  }))

  await common.manageElements(instance, 'extIncStates', common.getItemToAddEditDelete({
    storage,
    storageName: 'extIncStates',
    idPropName: 'ExtIncomingId',
    ExtIncomingId: arr.ExtIncoming.id,
    array: arr.ExtIncStates
  }))

  await common.manageElements(instance, 'extIncFiles', common.getItemToAddEditDelete({
    storage,
    storageName: 'extIncFiles',
    idPropName: 'ExtIncomingId',
    ExtIncomingId: arr.ExtIncoming.id,
    array: arr.ExtIncFiles
  }))

  await common.manageElements(instance, 'resolutions', common.getItemToAddEditDelete({
    storage,
    storageName: 'resolutions',
    idPropName: 'extIncoming',
    extIncoming: arr.ExtIncoming.id,
    array: arr.Resolutions
  }))
  await storage.extIncomings.update(arr.ExtIncoming.id)
  await storage.types.updateAll()
  await storage.states.updateAll()
}

async function deleteRelEntitys (storage, entity, fieldName, id) {
  const doc = storage.extIncomings.indexed[id]
  if (doc.isValid) {
    const itemsToDelete = doc[fieldName]
    await storage[entity].deleteItem(itemsToDelete)
  }
}

function getStatesAndNumbersToDelete (storage, id) {
  const doc = storage.extIncomings.indexed[id]
  if (!doc.isValid) { return }
  const statearr = []
  const incNumarr = []
  doc.ExtIncDepData.forEach((el) => {
    if (el.state) {
      const state = storage.extIncStates.indexed[el.state.ExtIncStateId]
      if (state.isValid) { statearr.push(state.id) }
    }
    if (el.incNumber) {
      const incNumber = storage.incNumbers.indexed[el.incNumber.ExtIncNumberId]
      if (incNumber.isValid) { incNumarr.push(incNumber.id) }
    }
  })
  return { statearr, incNumarr }
}

export async function deleteExtIncomings (instance, ids) {
  const { itemsId, storage } = await common.getItemsId(instance, ids)
  for (const id of itemsId) {
    const { statearr, incNumarr } = getStatesAndNumbersToDelete(storage, id)
    await Promise.all([
      storage.extIncStates.deleteItem(statearr),
      storage.incNumbers.deleteItem(incNumarr),
      deleteRelEntitys(storage, 'extIncFiles', 'filesId', id),
      deleteRelEntitys(storage, 'resolutions', 'resolutions', id)
    ])
  }
  await storage.extIncomings.delete(itemsId)
}
