const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')
const Docs = require('../server/models/docs')

moment.locale('ru')

function getNumber (str) {
  for (let j = +str.length - 1; j >= 0; j--) {
    if (str[j] === '/') {
      return str.slice(j + 1 - str.length)
    }
  }
}
module.exports = {
  async findAndCorrectExtOut () {
    console.time('findAndCorrectExtOut done!')
    const output = await Docs.ExtOutgoing.findAll()
    const extOut = []
    const extOutWithAnswer = []
    for (let index = 0; index < output.length; index++) {
      extOut[index] = JSON.parse(JSON.stringify(output[index]))
    }
    for (let index = 0; index < extOut.length; index++) {
      extOut[index].noteParsed = JSON.parse(extOut[index].note)
    }
    for (let index = 0; index < extOut.length; index++) {
      if (extOut[index].noteParsed) {
        if (extOut[index].noteParsed.VXNOM) {
          extOutWithAnswer.push(extOut[index])
        }
      }
      const extOutgoing = output.find(el => el.dataValues.id === extOut[index].id)
      if (extOutgoing) {
        const number = extOutgoing.prefix + extOutgoing.outNumber
        const complexnumber = number.split('/')
        if (complexnumber.length === 3) {
          extOutgoing.prefix = complexnumber[0] + '/'
          extOutgoing.outNumber = complexnumber[1] + '/' + complexnumber[2]
          await extOutgoing.save()
        }
      }
    }
    for (let index = 0; index < extOutWithAnswer.length; index++) {
      const item = extOutWithAnswer[index]
      const vxnom = item.noteParsed.VXNOM.split(' ')
      // const dvxo = item.noteParsed.DVXO
      const year = '20' + vxnom[0]
      const start = `${year}-01-01T00:00:00.000Z`
      const end = `${year}-12-31T23:59:59.999Z`
      // console.log(start)
      // console.log(end)
      const num1 = +getNumber(vxnom[2])
      // console.log(num1)
      if (!isNaN(num1)) {
        const extId = await Docs.IncomingNumber.findOne({
          where: {
            [Op.and]: [{ incDate: { [Op.gte]: start, [Op.lt]: end } }, { incNumber: num1 }]
          }
        })
        if (extId) {
          const extInc = await extId.getExtIncoming() || {}
          const extOutgoing = output.find(el => el.dataValues.id === item.id)
          if (extOutgoing) {
            // console.log(JSON.stringify(extOutgoing, null, 2))
            await extOutgoing.setAnswer(null)
            await extOutgoing.setAnswer(extInc.id)
          }
          // console.log(JSON.stringify(extInc, null, 2))
        }
      }
    }
    console.timeEnd('findAndCorrectExtOut done!')
  },

  async findAndCorrectIntOut () {
    console.time('findAndCorrectIntOut done!')
    const output = await Docs.IntOutgoing.findAll()
    const intOut = []
    const intOutWithAnswer = []
    for (let index = 0; index < output.length; index++) {
      intOut[index] = JSON.parse(JSON.stringify(output[index]))
    }
    for (let index = 0; index < intOut.length; index++) {
      intOut[index].noteParsed = JSON.parse(intOut[index].note)
    }
    for (let index = 0; index < intOut.length; index++) {
      if (intOut[index].noteParsed) {
        if (intOut[index].noteParsed.VXNOM) {
          intOutWithAnswer.push(intOut[index])
        }
      }
    }
    for (let index = 0; index < intOutWithAnswer.length; index++) {
      const item = intOutWithAnswer[index]
      const vxnom = item.noteParsed.VXNOM.split(' ')
      const year = '20' + vxnom[0]
      const start = `${year}-01-01T00:00:00.000Z`
      const end = `${year}-12-31T23:59:59.999Z`
      // console.log(start)
      // console.log(end)
      const num1 = +getNumber(vxnom[2])
      // console.log(num1)
      if (!isNaN(num1)) {
        const intId = await Docs.IntIncomingNumber.findOne({
          where: {
            [Op.and]: [{ incDate: { [Op.gte]: start, [Op.lt]: end } }, { incNumber: num1 }]
          }
        })
        if (intId) {
          const intInc = await intId.getIntIncoming() || {}
          const intOutgoing = output.find(el => el.dataValues.id === item.id)
          if (intOutgoing) {
            // console.log(JSON.stringify(extOutgoing, null, 2))
            await intOutgoing.setAnswer(null)
            await intOutgoing.setAnswer(intInc.id)
          }
          // console.log(JSON.stringify(extInc, null, 2))
        }
      }
    }
    console.timeEnd('findAndCorrectIntOut done!')
  }
}
