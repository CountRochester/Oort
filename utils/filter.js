// import metasync from 'metasync'
import * as metasync from '@/utils/metasync-array'
import { dateConvert } from '@/utils/date'
import { store } from './is-client'

const filterFun1 = (el, needToFindArr, row) => {
  let found = false
  const fn = (item, callback = setTimeout(() => { }, 0)) => {
    if (el[row] === item) { found = true }
    callback()
  }
  const done = (err) => {
    if (err) { console.log(err) }
  }
  metasync.some(needToFindArr, fn, done)
  return found
}
const filterFun2 = (el, needToFindArr, row) => {
  let found = false
  const fn = (item, callback = setTimeout(() => { }, 0)) => {
    if (el[row].includes(item.id)) { found = true }
    callback()
  }
  const done = (err) => {
    if (err) { console.log(err) }
  }
  metasync.some(needToFindArr, fn, done)
  return found
}
const filterFun3 = (el, needToFindArr, row) => {
  let found = false
  const fn = (item, callback = setTimeout(() => { }, 0)) => {
    if (el[row].includes(item)) { found = true }
    callback()
  }
  const done = (err) => {
    if (err) { console.log(err) }
  }
  metasync.some(needToFindArr, fn, done)
  return found
}
const filterFun4 = (el, needToFindArr, row) => {
  const defaultDateFrom = new Date('2016-01-01')
  const defaultDateTo = new Date()
  const date = +(new Date(dateConvert(el[row])))
  if (date >= (+needToFindArr[0] || defaultDateFrom) && date <= (+needToFindArr[1] || defaultDateTo)) {
    return true
  } else {
    return false
  }
}
const universalFilter = (fn, ...args) => {
  let output
  if (args[1].length || args[3]) {
    metasync.filter(
      args[0],
      (el, callback) => callback(null, fn(el, args[1], args[2])),
      (err, result) => {
        if (err) { throw err }
        output = result
      })
  } else {
    output = args[0]
  }
  return output
}

export function uniMultFilter (arr, needToFindArr, rowName) {
  return universalFilter(filterFun3, arr, needToFindArr, rowName)
}
export function uniSingleFilter (arr, needToFindArr, rowName) {
  return universalFilter(filterFun1, arr, needToFindArr, rowName)
}
export function uniOneFilter (arr, needToFind, rowName) {
  let output
  const filterFun = el => (needToFind === el[rowName])
  if (needToFind !== null && needToFind !== undefined) {
    metasync.filter(arr, (el, callback) => callback(null, filterFun(el)), (err, result) => {
      if (err) { throw err }
      output = result
    })
  } else {
    output = arr
  }
  return output
}
export function uniComplexFilter (arr, { needToFindArr, middleArr, middleRow, rowName }) {
  let output
  if (needToFindArr.length) {
    const filteredMiddleArr = uniSingleFilter(middleArr, needToFindArr, middleRow)
    output = universalFilter(filterFun2, arr, filteredMiddleArr, rowName, true)
  } else {
    output = arr
  }
  return output
}
export function uniComplexFilterMult (arr, { needToFindArr, middleArr, middleRow, rowName }) {
  let output
  if (needToFindArr.length) {
    const filteredMiddleArr = universalFilter(filterFun3, middleArr, needToFindArr, middleRow, true)
    output = universalFilter(filterFun2, arr, filteredMiddleArr, rowName, true)
  } else {
    output = arr
  }
  return output
}
export function uniSimpleTextFilter (arr, needToFind, rowName) {
  let output
  const filterFun = (el) => {
    return (el[rowName] !== null && el[rowName] !== undefined)
      ? el[rowName].toString().includes(needToFind)
      : false
  }
  if (needToFind) {
    metasync.filter(arr,
      (el, callback) => callback(null, filterFun(el)),
      (err, result) => {
        if (err) { throw err }
        output = result
      })
  } else {
    output = arr
  }
  return output
}
export function uniToComplexFilter (arr, { needToFindArr, middleArr, middleRow, rowName }) {
  let output
  if (needToFindArr.length) {
    let filteredMiddleArr
    metasync.filter(middleArr,
      (el, callback) => callback(null, filterFun3(el, needToFindArr, middleRow)),
      (err, result) => {
        if (err) { throw err }
        filteredMiddleArr = result
      })
    metasync.filter(arr,
      (el, callback) => callback(null, filterFun2(el, filteredMiddleArr, rowName)),
      (err, result) => {
        if (err) { throw err }
        output = result
      })
  } else {
    output = arr
  }
  return output
}
export function uniComplexDateFilter (arr, { middleArr, middleRow, rowName, dateFrom, dateTo }) {
  let output
  const defaultDateFrom = new Date('2016-01-01')
  const defaultDateTo = new Date()
  if ((+dateFrom !== +defaultDateFrom) && (+dateTo !== +defaultDateTo)) {
    let filteredMiddleArr
    metasync.filter(middleArr,
      (el, callback) => callback(null, filterFun4(el, [dateFrom, dateTo], middleRow)),
      (err, result) => {
        if (err) { throw err }
        filteredMiddleArr = result
      })
    metasync.filter(arr,
      (el, callback) => callback(null, filterFun2(el, filteredMiddleArr, rowName)),
      (err, result) => {
        if (err) { throw err }
        output = result
      })
  } else {
    output = arr
  }
  return output
}

function dateFilter (arr, row, dateFrom, dateTo) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  const defaultDateFrom = new Date('2016-01-01')
  const defaultDateTo = new Date()
  if (arr[row] == null) { return arr }
  if (+selectedFilters[dateTo] === +defaultDateTo && +selectedFilters[dateFrom] === +defaultDateFrom) {
    return arr
  }
  const filterFun = el => (el[row] >= (+selectedFilters[dateFrom] || +defaultDateFrom) &&
    el[row] <= (+selectedFilters[dateTo] || +defaultDateTo)) || !el[row]
  let output
  metasync.filter(arr, (el, callback) => callback(null, filterFun(el)), (err, result) => {
    if (err) { throw err }
    output = result
  })
  return output
}
function multipleFilter (arr, arrName, rowName) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[arrName]) { return arr }
  return uniMultFilter(arr, selectedFilters[arrName], rowName)
}
function singleFilter (arr, arrName, rowName) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[arrName]) { return arr }
  return uniSingleFilter(arr, selectedFilters[arrName], rowName)
}

function oneFilter (arr, propName, rowName) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (selectedFilters[propName] === undefined) { return arr }
  return uniOneFilter(arr, selectedFilters[propName], rowName)
}
function simpleTextFilter (arr, propName, rowName) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[propName]) { return arr }
  return uniSimpleTextFilter(arr, selectedFilters[propName], rowName)
}
function hasAnswer (arr, propName, rowName) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[propName]) { return arr }
  let output
  const filterFun = el => !!el[rowName].length === selectedFilters[propName]
  if (selectedFilters[propName] !== null && selectedFilters[propName] !== undefined) {
    metasync.filter(arr, (el, callback) => callback(null, filterFun(el)), (err, result) => {
      if (err) { throw err }
      output = result
    })
  } else {
    output = arr
  }
  return output
}

function complexFilter (arr, { arrName, entity, middleRow, rowName }) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[arrName]) { return arr }
  return uniComplexFilter(arr, {
    needToFindArr: selectedFilters[arrName],
    middleArr: window.$nuxt.$docs.buffer[entity].items,
    middleRow,
    rowName
  })
}

function complexFilterMult (arr, { arrName, entity, middleRow, rowName }) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[arrName]) { return arr }
  return uniComplexFilterMult(arr, {
    needToFindArr: selectedFilters[arrName],
    middleArr: window.$nuxt.$docs.buffer[entity].items,
    middleRow,
    rowName
  })
}

function toComplexFilter (arr, { arrName, entity, middleRow, rowName }) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!selectedFilters[arrName]) { return arr }
  return uniToComplexFilter(arr, {
    needToFindArr: selectedFilters[arrName],
    middleArr: window.$nuxt.$docs.buffer[entity].items,
    middleRow,
    rowName
  })
}
function complexDateFilter (arr, { entity, middleRow, rowName, dateFrom, dateTo }) {
  if (!store()) { return arr }
  const selectedFilters = store().getters['navInterface/selectedFilters']
  if (!dateFrom && !dateTo) { return arr }
  return uniComplexDateFilter(arr, {
    middleArr: window.$nuxt.$docs.buffer[entity].items,
    middleRow,
    rowName,
    dateFrom: selectedFilters[dateFrom],
    dateTo: selectedFilters[dateTo]
  })
}

export function filter (arr) {
  if (!store()) { return arr }
  const selectedTab = store().getters['navInterface/selectedDocsTab']
  switch (selectedTab) {
    case '#extIncoming': {
      const dateFilteredArr = dateFilter(arr, 'dateVx', 'dateFrom', 'dateTo')
      const orgFilteredArr = multipleFilter(dateFilteredArr, 'organisation', 'organisationsId')
      const stateFilteredArr = singleFilter(orgFilteredArr, 'state', 'depStateId')
      const podpisantFilteredArr = multipleFilter(stateFilteredArr, 'podpisants', 'authorsId')
      const typeFilteredArr = singleFilter(podpisantFilteredArr, 'type', 'typeId')
      const needAnswerFilteredArr = oneFilter(typeFilteredArr, 'needAnswer', 'needAnswer')
      const temaFilteredArr = multipleFilter(needAnswerFilteredArr, 'tema', 'temasId')
      const hasAnswerFilteredArr = hasAnswer(temaFilteredArr, 'hasAnswer', 'answersId')
      const depsFilteredArr = complexFilter(hasAnswerFilteredArr, {
        arrName: 'deps', // Массив, где содержится перечень выбранных для фильтрации элементов
        entity: 'currentPositions', // промежуточная сущность
        middleRow: 'DepartmentId', // свойство промежуточной сущности, через которую будет отфильрован конечный результат
        rowName: 'executantsId' // свойство (массив) фильтруемых записей, на которые ссылаетсяпромежуточная сущность
      })
      const subdivisionFilteredArr = complexFilterMult(depsFilteredArr, {
        arrName: 'subdivision',
        entity: 'currentPositions',
        middleRow: 'SubdivisionId',
        rowName: 'executantsId'
      })
      const execsFilteredArr = multipleFilter(subdivisionFilteredArr, 'executants', 'executantsId')
      const outNumFilteredArr = simpleTextFilter(execsFilteredArr, 'outNum', 'extNumber')
      const outDateFilteredArr = simpleTextFilter(outNumFilteredArr, 'outDate', 'extDate')
      return outDateFilteredArr

      // console.log(outDateFilteredArr)
      // return reduceArr(outDateFilteredArr, 1500)
      // return arr
    }

    case '#extOutgoing': {
      const dateFilteredArr = dateFilter(arr, 'dateIsh', 'dateFrom', 'dateTo')
      const orgFilteredArr = complexFilter(dateFilteredArr, {
        arrName: 'organisation',
        entity: 'extCurrentPositions',
        middleRow: 'OrganisationId',
        rowName: 'addresseesId'
      })
      const toFilteredArr = multipleFilter(orgFilteredArr, 'addressees', 'addresseesId')
      const stateFilteredArr = singleFilter(toFilteredArr, 'state', 'stateId')
      const depsFilteredArr = complexFilter(stateFilteredArr, {
        arrName: 'deps',
        entity: 'currentPositions',
        middleRow: 'DepartmentId',
        rowName: 'podpisantsId'
      })
      const subdivisionFilteredArr = complexFilterMult(depsFilteredArr, {
        arrName: 'subdivision',
        entity: 'currentPositions',
        middleRow: 'SubdivisionId',
        rowName: 'podpisantsId'
      })
      const podpisantFilteredArr = multipleFilter(subdivisionFilteredArr, 'podpisants', 'podpisantsId')
      const typeFilteredArr = singleFilter(podpisantFilteredArr, 'type', 'typeId')
      const authorFilteredArr = singleFilter(typeFilteredArr, 'author', 'authorId')
      const answerOrgFilteredArr = toComplexFilter(authorFilteredArr, {
        arrName: 'answerOrg',
        entity: 'extIncomings',
        middleRow: 'organisationsId',
        rowName: 'isAnswerOnId'
      })
      const answerDateFilteredArr = complexDateFilter(answerOrgFilteredArr, {
        entity: 'extIncomings',
        middleRow: 'extDate',
        rowName: 'isAnswerOnId',
        dateFrom: 'answerDateFrom',
        dateTo: 'answerDateTo'
      })
      const isAnswerOnFilteredArr = multipleFilter(answerDateFilteredArr, 'isAnswerOn', 'isAnswerOnId')
      const temaFilteredArr = multipleFilter(isAnswerOnFilteredArr, 'tema', 'temasId')
      return temaFilteredArr

      // console.log(temaFilteredArr)
      // return reduceArr(temaFilteredArr, 1500)
      // return arr
    }

    case '#intIncoming': {
      const dateFilteredArr = dateFilter(arr, 'dateVx', 'dateFrom', 'dateTo')
      const depsFilteredArr = complexFilter(dateFilteredArr, {
        arrName: 'deps',
        entity: 'currentPositions',
        middleRow: 'DepartmentId',
        rowName: 'podpisantsId'
      })
      const podpisantFilteredArr = multipleFilter(depsFilteredArr, 'podpisants', 'podpisantsId')
      const outNumPrefixFilteredArr = simpleTextFilter(podpisantFilteredArr, 'outNumPrefix', 'extNumberPrefix')
      const outNumFilteredArr = simpleTextFilter(outNumPrefixFilteredArr, 'outNum', 'extNumber')
      const outDateFilteredArr = simpleTextFilter(outNumFilteredArr, 'outDate', 'extDate')
      const stateFilteredArr = singleFilter(outDateFilteredArr, 'state', 'stateId')
      const typeFilteredArr = singleFilter(stateFilteredArr, 'type', 'typeId')
      const needAnswerFilteredArr = oneFilter(typeFilteredArr, 'needAnswer', 'needAnswer')
      const hasAnswerFilteredArr = hasAnswer(needAnswerFilteredArr, 'hasAnswer', 'answersId')
      const temaFilteredArr = multipleFilter(hasAnswerFilteredArr, 'tema', 'temasId')
      const execDepsFilteredArr = complexFilter(temaFilteredArr, {
        arrName: 'execDeps',
        entity: 'currentPositions',
        middleRow: 'DepartmentId',
        rowName: 'addresseesId'
      })
      const execSubdivisionFilteredArr = complexFilterMult(execDepsFilteredArr, {
        arrName: 'subdivision',
        entity: 'currentPositions',
        middleRow: 'SubdivisionId',
        rowName: 'addresseesId'
      })
      const execsFilteredArr = multipleFilter(execSubdivisionFilteredArr, 'executants', 'addresseesId')
      return execsFilteredArr
      // console.log(execsFilteredArr)
      // return reduceArr(execsFilteredArr, 10000)
      // return arr
    }

    case '#intOutgoing': {
      const dateFilteredArr = dateFilter(arr, 'dateIsh', 'dateFrom', 'dateTo')
      const depFilteredArr = complexFilter(dateFilteredArr, {
        arrName: 'execDeps',
        entity: 'currentPositions',
        middleRow: 'DepartmentId',
        rowName: 'addresseesId'
      })
      const toFilteredArr = multipleFilter(depFilteredArr, 'executants', 'addresseesId')
      const stateFilteredArr = singleFilter(toFilteredArr, 'state', 'stateId')
      const depsFilteredArr = complexFilter(stateFilteredArr, {
        arrName: 'deps',
        entity: 'currentPositions',
        middleRow: 'DepartmentId',
        rowName: 'podpisantsId'
      })
      const podpisantFilteredArr = multipleFilter(depsFilteredArr, 'podpisants', 'podpisantsId')
      const typeFilteredArr = singleFilter(podpisantFilteredArr, 'type', 'typeId')
      const temaFilteredArr = multipleFilter(typeFilteredArr, 'tema', 'temasId')
      const authorFilteredArr = singleFilter(temaFilteredArr, 'author', 'authorId')
      const answerDepFilteredArr = complexFilter(authorFilteredArr, {
        arrName: 'answerDep',
        entity: 'intIncomings',
        middleRow: 'authorDepartmentId',
        rowName: 'isAnswerOnId'
      })
      const answerDateFilteredArr = complexDateFilter(answerDepFilteredArr, {
        entity: 'intIncomings',
        middleRow: 'extDate',
        rowName: 'isAnswerOnId',
        dateFrom: 'answerDateFrom',
        dateTo: 'answerDateTo'
      })
      return answerDateFilteredArr
      // return reduceArr(answerDateFilteredArr, 10000)
      // return arr
    }
  }
}
