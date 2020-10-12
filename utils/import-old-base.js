// import _ from 'lodash'
// import moment from 'moment'
// import dbOld from '@/server/db/old'
// import Docs from '@/server/db/docs'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Sequelize = require('sequelize')
const moment = require('moment')
const Op = Sequelize.Op
const dbOld = require('../server/models/old')
const Docs = require('../server/models/docs')
const intIncomingLib = require('../server/graphql/resolver/docs/int-incoming')
const extIncomingLib = require('../server/graphql/resolver/docs/ext-incoming')
const extOutgoingLib = require('../server/graphql/resolver/docs/ext-outgoing')
const intOutgoingLib = require('../server/graphql/resolver/docs/int-outgoing')
const intIncFileLib = require('../server/graphql/resolver/docs/int-inc-file')
const intOutFileLib = require('../server/graphql/resolver/docs/int-out-file')
const extIncFileLib = require('../server/graphql/resolver/docs/ext-inc-file')
const extOutFileLib = require('../server/graphql/resolver/docs/ext-out-file')
const extIncNumberLib = require('../server/graphql/resolver/docs/incoming-number')
const intIncNumberLib = require('../server/graphql/resolver/docs/int-incoming-number')
const intIncNoteLib = require('../server/graphql/resolver/docs/int-inc-note')
const extIncNoteLib = require('../server/graphql/resolver/docs/ext-inc-note')
const keys = require('../server/keys')

moment.locale('ru')

async function formOldVx () {
  try {
    console.time('formOldVx')
    const oldVx = await dbOld.Vx.findAll()
    console.timeEnd('formOldVx')
    return oldVx
  } catch (error) {
    throw error
  }
}

async function formOldVxOtpr () {
  try {
    console.time('formOldVxOtpr')
    const oldVxOtpr = await dbOld.VxOtpr.findAll()
    const output = []
    oldVxOtpr.forEach((item) => {
      output.push(JSON.parse(JSON.stringify(item, null, 2)))
    })
    console.timeEnd('formOldVxOtpr')
    return output
  } catch (error) {
    throw error
  }
}

async function formOldVxTip () {
  try {
    console.time('formOldVxTip')
    const oldVxTip = await dbOld.VxTip.findAll()
    const output = []
    oldVxTip.forEach((item) => {
      output.push(JSON.parse(JSON.stringify(item, null, 2)))
    })
    console.timeEnd('formOldVxTip')
    return output
  } catch (error) {
    throw error
  }
}

async function formOldVxSubj () {
  try {
    console.time('formOldVxSubj')
    const oldVxSubj = await dbOld.VxSubj.findAll()
    const output = []
    oldVxSubj.forEach((item) => {
      output.push(JSON.parse(JSON.stringify(item, null, 2)))
    })
    console.timeEnd('formOldVxSubj')
    return output
  } catch (error) {
    throw error
  }
}

function formInternalRequest (item) {
  let extNumber
  let extNumberPrefix
  let extDate
  if (item.NISH) {
    for (let j = item.NISH.length - 1; j >= 0; j--) {
      if (item.NISH[j] === '/' ||
        item.NISH[j] === '-' ||
        item.NISH[j] === '\\' ||
        item.NISH[j] === ' ') {
        extNumber = +item.NISH.slice(-(item.NISH.length - j - 1))
        extNumberPrefix = item.NISH.slice(0, j + 1)
      }
    }
    if (!extNumber) {
      extNumber = Math.floor(Math.random() * 10e5)
      extNumberPrefix = '000/'
    }
    extDate = item.DATISH
  } else {
    extNumber = Math.floor(Math.random() * 10e5)
    extNumberPrefix = '00/'
    extDate = item.DATT
  }
  const request = {
    intIncoming: {
      subject: item.subject,
      extNumber,
      extNumberPrefix,
      extDate,
      TypeId: item.newTip
    },
    podpisantId: [item.newIn],
    authorId: item.newIn,
    addresseeId: ['2']
  }
  return request
}

function formOutNumber ({ NMESTONAH, DATT }, type = 0) {
  let outNumber
  let prefix
  let outDate
  if (NMESTONAH) {
    const number = NMESTONAH.split(' ')[1]
    if (number) {
      for (let j = 0; j < number.length; j++) {
        if (number[j] === '/' ||
          number[j] === '-' ||
          number[j] === '\\') {
          prefix = number.slice(0, j + 1)
          outNumber = !type ? +number.slice(j + 1) : number.slice(j + 1)
        }
      }
    }
    if (!outNumber) {
      outNumber = Math.floor(Math.random() * 10e5)
      prefix = '000/'
    }
    outDate = DATT
  } else {
    outNumber = Math.floor(Math.random() * 10e5)
    prefix = '00/'
    outDate = DATT
  }
  return { outNumber, prefix, outDate }
}

function formInternalOutRequest (item) {
  const outNumber = formOutNumber(item)
  const request = {
    intOutgoing: {
      ...outNumber,
      subject: item.subject,
      author: item.newIsp[0],
      TypeId: item.newTip.newTip
    },
    podpisantId: item.newPodpisants,
    answerId: item.newAnswer,
    addresseeId: item.newInt
  }
  return request
}

function formExternalRequest (item) {
  const request = {
    extIncoming: {
      subject: item.subject,
      extNumber: item.NISH,
      extDate: item.DATISH,
      TypeId: item.newTip
    },
    authorId: item.newExt,
    execId: ['2']
  }
  return request
}

function formExternalOutRequest (item) {
  const outNumber = formOutNumber(item, 1)
  const request = {
    extOutgoing: {
      ...outNumber,
      subject: item.subject,
      authorId: item.newIsp[0],
      TypeId: item.newTip.newTip
    },
    extCurrentPositionId: item.newExt,
    podpisantId: item.newPodpisants,
    answerId: item.newAnswer
  }
  return request
}

function getFileNames () {
  const dirPath = path.join(keys.STATIC_DIR, keys.UPLOAD_STORAGE)
  const files = []
  const fileArray = fs.readdirSync(dirPath)
  fileArray.forEach((el) => {
    let extention
    let fileName
    let prefix
    let NOM
    let key
    if (el) {
      for (let j = el.length - 1; j >= 0; j--) {
        if (el[j] === '.') {
          extention = el.slice(j + 1 - el.length)
          fileName = el.slice(0, j)
        }
      }
    }
    if (fileName) {
      prefix = fileName.slice(0, 5)
      const k = fileName.indexOf('a')
      NOM = fileName.slice(5, k)
      key = fileName.slice(k + 1)
    }
    files.push({
      fullname: el,
      fileName,
      extention,
      prefix,
      NOM,
      key
    })
  })
  return files
}

async function addExtFile ({ NOM }, extIncId, files) {
  try {
    if (NOM) {
      const extFiles = []
      files.forEach((el) => {
        if (el.NOM === NOM) {
          extFiles.push(el)
        }
      })
      let req1
      if (extFiles.length) {
        let fileIds = []
        for (const elem of extFiles) {
          req1 = {
            extIncFile: {
              file: elem.fullname
            }
          }
          const mes = await extIncFileLib.addExtIncFile(req1)
          // const mes = {
          //   text: 'Файл успешно добавлен',
          //   messageType: 'success',
          //   id: '4'
          // }
          fileIds = [...fileIds, mes.id]
        }
        // await console.log(fileIds)
        await extIncFileLib.attachFilesToExtInc({ fileIds, extIncId })
      }
    }
  } catch (error) {
    throw error
  }
}

async function addExtOutFile ({ NOMIS }, extOutId, files) {
  try {
    console.log('NOMIS')
    console.log(NOMIS)
    console.log('extOutId')
    console.log(extOutId)
    if (NOMIS) {
      const extFiles = []
      files.forEach((el) => {
        if (el.NOM === NOMIS) {
          extFiles.push(el)
        }
      })
      let req1
      if (extFiles.length) {
        let fileIds = []
        for (const elem of extFiles) {
          req1 = {
            extOutFile: {
              file: elem.fullname
            }
          }
          const mes = await extOutFileLib.addExtOutFile(req1)
          // const mes = {
          //   text: 'Файл успешно добавлен',
          //   messageType: 'success',
          //   id: '4'
          // }
          // console.log(mes)
          // console.log(fileIds)
          fileIds = [...fileIds, mes.id]
          // console.log(fileIds)
        }
        // console.log(fileIds)
        await extOutFileLib.attachFilesToExtOut({ fileIds, extOutId })
        // console.log(mes2)
      }
    }
  } catch (error) {
    throw error
  }
}

async function addIntFile ({ NOM }, intIncId, files) {
  try {
    if (NOM) {
      const intFiles = []
      files.forEach((el) => {
        if (el.NOM === NOM) {
          intFiles.push(el)
        }
      })
      let req1
      if (intFiles.length) {
        let fileIds = []
        for (const elem of intFiles) {
          req1 = {
            intIncFile: {
              file: elem.fullname
            }
          }
          const mes = await intIncFileLib.addIntIncFile(req1)
          // const mes = ['7']
          // console.log(mes)
          fileIds = [...fileIds, mes.id]
        }
        // console.log(fileIds)
        await intIncFileLib.attachFilesToIntInc({ fileIds, intIncId })
      }
    }
  } catch (error) {
    throw error
  }
}

async function addIntOutFile ({ NOMIS }, intOutId, files) {
  try {
    if (NOMIS) {
      const intFiles = []
      files.forEach((el) => {
        if (el.NOM === NOMIS) {
          intFiles.push(el)
        }
      })
      let req1
      if (intFiles.length) {
        let fileIds = []
        for (const elem of intFiles) {
          req1 = {
            intOutFile: {
              file: elem.fullname
            }
          }
          const mes = await intOutFileLib.addIntOutFile(req1)
          // const mes = ['7']
          // console.log(mes)
          fileIds = [...fileIds, mes.id]
        }
        // console.log(fileIds)
        await intOutFileLib.attachFilesToIntOut({ fileIds, intOutId })
      }
    }
  } catch (error) {
    throw error
  }
}

function getNumber (str) {
  for (let j = +str.length - 1; j >= 0; j--) {
    if (str[j] === '/') {
      return str.slice(j + 1 - str.length)
    }
  }
}

async function addExtIncNum (item, extIncId) {
  const number = item.NMESTONAH
  let request = {}
  if (number) {
    request = {
      incomingNumber: {
        incNumber: getNumber(number),
        incDate: item.DATT,
        prefix: 'СКБ/',
        DepartmentId: '1',
        ExtIncomingId: extIncId
      }
    }
  }
  // await console.log(request)
  await extIncNumberLib.addIncomingNumber(request)
}

async function addIntIncNum (item, intIncId) {
  const number = item.NMESTONAH
  let request = {}
  let incNumber
  if (number) {
    for (let j = number.length - 1; j >= 0; j--) {
      if (number[j] === '/') {
        incNumber = +number.slice(j + 1 - number.length)
        break
      }
    }
    request = {
      intIncomingNumber: {
        incNumber,
        incDate: item.DATT,
        prefix: 'СКБ/',
        DepartmentId: '1',
        IntIncomingId: intIncId
      }
    }
  }
  // await console.log(request)
  await intIncNumberLib.addIntIncomingNumber(request)
}

async function addExtIncNote (item, extIncId) {
  const text = JSON.stringify(item)
  const request = {
    extIncNote: {
      text,
      ExtIncomingId: extIncId,
      DepartmentId: '1'
    }
  }
  // await console.log(request)
  await extIncNoteLib.addExtIncNote(request)
}

async function addIntIncNote (item, intIncId) {
  const text = JSON.stringify(item)
  const request = {
    intIncNote: {
      text,
      IntIncomingId: intIncId,
      DepartmentId: '1'
    }
  }
  // await console.log(request)
  await intIncNoteLib.addIntIncNote(request)
}

async function addExtOutNote (item, id) {
  try {
    const note = JSON.stringify(item)
    await extOutgoingLib.addNoteToExtOutgoing({ id, note })
  } catch (error) {
    throw error
  }
}

async function addIntOutNote (item, id) {
  try {
    const note = JSON.stringify(item)
    await intOutgoingLib.addNoteToIntOutgoing({ id, note })
  } catch (error) {
    throw error
  }
}

async function formOldIs () {
  try {
    console.time('formOldIs')
    const oldIs = await dbOld.Is.findAll()
    const output = []
    oldIs.forEach((el) => {
      output.push(JSON.parse(JSON.stringify(el)))
    })
    console.timeEnd('formOldIs')
    return output
  } catch (error) {
    throw error
  }
}

async function formOldIsPol () {
  try {
    console.time('formOldIsPol')
    const oldIsPol = await dbOld.IsPol.findAll()
    const output = []
    oldIsPol.forEach((el) => {
      output.push(JSON.parse(JSON.stringify(el)))
    })
    console.timeEnd('formOldIsPol')
    return output
  } catch (error) {
    throw error
  }
}

async function formOldIsIspol () {
  try {
    console.time('formOldIsIspol')
    const oldIsIspol = await dbOld.IsIspol.findAll()
    const output = []
    oldIsIspol.forEach((el) => {
      output.push(JSON.parse(JSON.stringify(el)))
    })
    console.timeEnd('formOldIsIspol')
    return output
  } catch (error) {
    throw error
  }
}

async function formOldIsOtprav () {
  try {
    console.time('formOldIsOtprav')
    const oldIsOtprav = await dbOld.IsOtprav.findAll()
    const output = []
    oldIsOtprav.forEach((el) => {
      output.push(JSON.parse(JSON.stringify(el)))
    })
    console.timeEnd('formOldIsOtprav')
    return output
  } catch (error) {
    throw error
  }
}

async function formOldIsSubj () {
  try {
    console.time('formOldIsSubj')
    const oldIsSubj = await dbOld.IsSubj.findAll()
    const output = []
    oldIsSubj.forEach((el) => {
      output.push(JSON.parse(JSON.stringify(el)))
    })
    console.timeEnd('formOldIsSubj')
    return output
  } catch (error) {
    throw error
  }
}

function formArray (input) {
  if (input) {
    return _.replace(input, /[ ]+/g, '').split(',')
  } else {
    return null
  }
}

async function findAnswer ({ VXNOM, DVXO, DATT }) {
  try {
    const numbers = VXNOM ? VXNOM.split(' ') : []
    if (numbers.length && numbers.length < 6) {
      const year = '20' + numbers[0]
      const start = `${year}-01-01T00:00:00.000Z`
      const end = `${year}-12-31T23:59:59.999Z`
      const nums = []
      // console.log(start)
      // console.log(end)
      for (let i = 2; i < numbers.length; i++) {
        const item = numbers[i]
        const num = +getNumber(item)
        nums.push(isNaN(num) ? null : num)
      }
      // console.log(nums)
      const extIds = await Docs.IncomingNumber.findAll({
        attributes: ['id'],
        where: {
          incNumber: { [Op.in]: nums },
          incDate: { [Op.gte]: start, [Op.lt]: end }
        }
      })
      const intIds = await Docs.IntIncomingNumber.findAll({
        attributes: ['id'],
        where: {
          incNumber: { [Op.in]: nums },
          incDate: { [Op.gte]: start, [Op.lt]: end }
        }
      })
      const fetchedExtIds = Object.values(JSON.parse(JSON.stringify(extIds, null, 2))).reduce((acc, item, index) => { acc[index] = item.id; return acc }, [])
      const fetchedIntIds = Object.values(JSON.parse(JSON.stringify(intIds, null, 2))).reduce((acc, item, index) => { acc[index] = item.id; return acc }, [])
      return [...fetchedExtIds, ...fetchedIntIds]
    } else if (numbers.length === 6) {
      const year1 = '20' + numbers[0]
      const start1 = `${year1}-01-01T00:00:00.000Z`
      const end1 = `${year1}-12-31T23:59:59.999Z`
      const year2 = '20' + numbers[3]
      const start2 = `${year2}-01-01T00:00:00.000Z`
      const end2 = `${year2}-12-31T23:59:59.999Z`
      // console.log(start)
      // console.log(end)
      const num1 = +getNumber(numbers[2])
      const num2 = +getNumber(numbers[5])
      // console.log(nums)
      const extIds = await Docs.IncomingNumber.findAll({
        attributes: ['id'],
        where: {
          [Op.or]: [
            { [Op.and]: [{ incDate: { [Op.gte]: start1, [Op.lt]: end1 } }, { incNumber: num1 }] },
            { [Op.and]: [{ incDate: { [Op.gte]: start2, [Op.lt]: end2 } }, { incNumber: num2 }] }
          ]
        }
      })
      const intIds = await Docs.IntIncomingNumber.findAll({
        attributes: ['id'],
        where: {
          [Op.or]: [
            { [Op.and]: [{ incDate: { [Op.gte]: start1, [Op.lt]: end1 } }, { incNumber: num1 }] },
            { [Op.and]: [{ incDate: { [Op.gte]: start2, [Op.lt]: end2 } }, { incNumber: num2 }] }
          ]
        }
      })
      const fetchedExtIds = Object.values(JSON.parse(JSON.stringify(extIds, null, 2))).reduce((acc, item, index) => { acc[index] = item.id; return acc }, [])
      const fetchedIntIds = Object.values(JSON.parse(JSON.stringify(intIds, null, 2))).reduce((acc, item, index) => { acc[index] = item.id; return acc }, [])
      // console.log([...fetchedExtIds, ...fetchedIntIds])
      return [...fetchedExtIds, ...fetchedIntIds]
    }
  } catch (error) {
    throw error
  }
}

module.exports = {
  async importVxFromOldBase () {
    try {
      console.time('importVxFromOldBase')
      const oldVx = await formOldVx()
      const oldVxOtpr = await formOldVxOtpr()
      const oldVxTips = await formOldVxTip()
      const oldVxSubjs = await formOldVxSubj()
      const extOldVx = []
      const intOldVx = []
      const files = getFileNames()
      for (let index = 0; index < oldVx.length; index++) {
        const item = JSON.parse(JSON.stringify(oldVx[index], null, 2))
        const otpr = oldVxOtpr.find(el => el.OTPR === item.OTPR) || {}
        const newTip = oldVxTips.find(el => el.TIP === item.TIP) || {}
        const subj = oldVxSubjs.find(el => el.NMESTONAH === item.NMESTONAH) || {}
        if (otpr) {
          // console.log(otpr)
          if (otpr.newExt) {
            const newItems1 = {
              newExt: otpr.newExt,
              newTip: newTip.newTip,
              subject: subj.subject
            }
            extOldVx.push({ ...item, ...newItems1 })
          } else
          if (otpr.newIn) {
            const newItems2 = {
              newIn: otpr.newIn,
              newTip: newTip.newTip,
              subject: subj.subject
            }
            intOldVx.push({ ...item, ...newItems2 })
          }
        }
      }
      for (let i = 40; i < intOldVx.length; i++) {
        console.log(`Processing Internal VX №${i} of ${intOldVx.length}`)
        const item = intOldVx[i]
        // console.log(item)
        const request = formInternalRequest(item)
        // console.log(request)
        const mes = await intIncomingLib.addIntIncoming(request)
        // const mes = {
        //   text: 'Входящий документ успешно добавлен',
        //   messageType: 'success',
        //   id: '33'
        // }
        await addIntFile(item, mes.id, files)
        await addIntIncNum(item, mes.id)
        await addIntIncNote(item, mes.id)
        console.log('Done')
      }
      console.log('Done with Internal VX')
      console.log('======================================')
      for (let i = 20; i < extOldVx.length; i++) {
        console.log(`Processing External VX №${i} of ${extOldVx.length}`)
        const item = extOldVx[i]
        // console.log(item)
        const request = formExternalRequest(item)
        // // console.log(request)
        const mes = await extIncomingLib.addExtIncoming(request)
        // const mes = {
        //   text: 'Входящий документ успешно добавлен',
        //   messageType: 'success',
        //   id: '33'
        // }
        await addExtFile(item, mes.id, files)
        await addExtIncNum(item, mes.id)
        await addExtIncNote(item, mes.id)
        console.log('Done')
      }
      console.log('Done with External VX')
      console.log('======================================')
      console.log('Всего внешних входящих: ' + extOldVx.length)
      console.log('Всего внутренних входящих: ' + intOldVx.length)
      console.log('Всего файлов: ' + files.length)
      console.timeEnd('importVxFromOldBase')
    } catch (error) {
      throw error
    }
  },

  async syncIncNums () {
    try {
      console.time('syncIncNums')
      const oldVx = await formOldVx()
      const oldVxOtpr = await formOldVxOtpr()
      const oldVxTips = await formOldVxTip()
      const oldVxSubjs = await formOldVxSubj()
      const extOldVx = []
      const intOldVx = []
      for (let index = 0; index < oldVx.length; index++) {
        const item = JSON.parse(JSON.stringify(oldVx[index], null, 2))
        const otpr = oldVxOtpr.find(el => el.OTPR === item.OTPR) || {}
        const newTip = oldVxTips.find(el => el.TIP === item.TIP) || {}
        const subj = oldVxSubjs.find(el => el.NMESTONAH === item.NMESTONAH) || {}
        if (otpr) {
          if (otpr.newExt) {
            const newItems1 = {
              newExt: otpr.newExt,
              newTip: newTip.newTip,
              subject: subj.subject
            }
            extOldVx.push({ ...item, ...newItems1 })
          } else
          if (otpr.newIn) {
            const newItems2 = {
              newIn: otpr.newIn,
              newTip: newTip.newTip,
              subject: subj.subject
            }
            intOldVx.push({ ...item, ...newItems2 })
          }
        }
      }
      // extOldVx.length
      // for (let i = 0; i < extOldVx.length; i++) {
      //   console.log(`Processing External VX №${i} of ${extOldVx.length}`)
      //   const item = extOldVx[i]
      //   const text = JSON.stringify(item)
      //   // console.log(item)
      //   const output = await Docs.ExtIncoming.findOne({
      //     attributes: [
      //       'id'
      //     ],
      //     include: [
      //       // Примечания
      //       {
      //         model: Docs.ExtIncNote,
      //         attributes: [
      //           'id',
      //           'text',
      //           'DepartmentId'
      //         ],
      //         where: {
      //           text
      //         }
      //       }
      //     ]
      //   })
      //   const fetched = JSON.parse(JSON.stringify(output))
      //   if (fetched) {
      //     // console.log(fetched)
      //     const incNum = await Docs.IncomingNumber.findOne({
      //       where: {
      //         ExtIncomingId: fetched.id
      //       }
      //     })
      //     // const fetchedIncNum = JSON.parse(JSON.stringify(incNum))
      //     // console.log(fetchedIncNum)
      //     if (!incNum) {
      //       await addExtIncNum(item, fetched.id)
      //     }
      //   }
      //   console.log('Done')
      // }
      console.log('Done with External VX')
      console.log('======================================')
      for (let i = 0; i < intOldVx.length; i++) {
        console.log(`Processing Internal VX №${i} of ${intOldVx.length}`)
        const item = intOldVx[i]
        const text = JSON.stringify(item)
        // console.log(item)
        const output = await Docs.IntIncoming.findOne({
          attributes: [
            'id'
          ],
          include: [
            // Примечания
            {
              model: Docs.IntIncNote,
              attributes: [
                'id',
                'text',
                'DepartmentId'
              ],
              where: {
                text
              }
            }
          ]
        })
        const fetched = JSON.parse(JSON.stringify(output))
        if (fetched) {
          // console.log(fetched)
          const incNum = await Docs.IntIncomingNumber.findOne({
            where: {
              IntIncomingId: fetched.id
            }
          })
          // const fetchedIncNum = JSON.parse(JSON.stringify(incNum))
          // console.log(fetchedIncNum)
          if (!incNum) {
            await addIntIncNum(item, fetched.id)
          }
        }
        console.log('Done')
      }
      console.timeEnd('syncIncNums')
    } catch (error) {
      throw error
    }
  },

  async importIsFromOldBase () {
    try {
      console.log('Start')
      const oldIs = await formOldIs()
      const oldIsPol = await formOldIsPol()
      const oldIsIspol = await formOldIsIspol()
      const oldIsOtprav = await formOldIsOtprav()
      const oldIsSubj = await formOldIsSubj()
      const oldVxTips = await formOldVxTip()
      const oldIsInt = []
      const oldIsExt = []
      const files = getFileNames()
      for (let index = 0; index < oldIs.length; index++) {
        const item = oldIs[index]
        let element = oldIsPol.find(el => el.POL === item.POL)
        const newIntPol = element ? formArray(element.NewInt) : null
        const newExtPol = element ? formArray(element.NewExt) : null
        let ispArr = []
        element = oldIsIspol.find(el => el.ISPOL === item.ISPOL)
        const isp = element ? element.newIsp : null
        if (isp) {
          ispArr = formArray(isp)
        }
        let podpisants = []
        element = oldIsOtprav.find(el => el.OTPRAV === item.OTPRAV)
        const podp = element ? element.newOtpr : null
        podpisants = formArray(podp)
        element = oldIsSubj.find(el => el.NMESTONAH === item.NMESTONAH)
        const subject = element ? element.Subject : null
        const newTip = oldVxTips.find(el => el.TIP === item.TIP) || {}
        if (newIntPol && newIntPol.length) {
          const dop = {
            newInt: newIntPol,
            newIsp: ispArr,
            newPodpisants: podpisants,
            newTip,
            subject,
            newAnswer: await findAnswer(item)

          }
          oldIsInt.push({ ...item, ...dop })
        }
        if (newExtPol && newExtPol.length) {
          const dop = {
            newExt: newExtPol,
            newIsp: ispArr,
            newPodpisants: podpisants,
            newTip,
            subject,
            newAnswer: await findAnswer(item)
          }
          oldIsExt.push({ ...item, ...dop })
        }
      }
      console.log('Импортирование внешних исходящих')
      // const end1 = oldIsExt.length
      const end1 = oldIsExt.length
      // for (let i = 20; i < end1; i++) {
      //   const item = oldIsExt[i]
      //   console.time('Импортирование элемента: ' + i + ' из ' + oldIsExt.length + ' - Готово')
      //   const mes = await extOutgoingLib.addExtOutgoing(formExternalOutRequest(item))
      //   // console.log(mes)
      //   // console.log(mes)
      //   await addExtOutFile(item, mes.id, files)
      //   await addExtOutNote(item, mes.id)
      //   console.timeEnd('Импортирование элемента: ' + i + ' из ' + oldIsExt.length + ' - Готово')
      // }
      console.log('Готово')
      console.log('================================================================================================')
      console.log('Импортирование внутренних исходящих')
      const end2 = oldIsInt.length
      for (let i = 1939; i < end2; i++) {
        const item = oldIsInt[i]
        console.time('Импортирование элемента: ' + i + ' из ' + oldIsInt.length + ' - Готово')
        const mes = await intOutgoingLib.addIntOutgoing(formInternalOutRequest(item))
        // console.log(mes)
        // console.log(mes)
        await addIntOutFile(item, mes.id, files)
        await addIntOutNote(item, mes.id)
        console.timeEnd('Импортирование элемента: ' + i + ' из ' + oldIsInt.length + ' - Готово')
      }
      console.log('Готово')
    } catch (error) {
      throw error
    }
  }
}
