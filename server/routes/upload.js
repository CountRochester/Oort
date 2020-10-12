const { Router } = require('express')
const extIncFile = require('../graphql/resolver/docs/ext-inc-file')
const extOutFile = require('../graphql/resolver/docs/ext-out-file')
const intIncFile = require('../graphql/resolver/docs/int-inc-file')
const intOutFile = require('../graphql/resolver/docs/int-out-file')
const internalFile = require('../graphql/resolver/docs/internal-file')
const Docs = require('../models/docs')

const router = Router()

router.post('/', async (req, res) => {
  try {
    const response = []
    for (const file of req.files) {
      let message
      let f
      switch (file.fieldname) {
        case 'extIncFile':
          message = await extIncFile.addExtIncFile(null, { extIncFile: { file: file.filename } })
          f = await Docs.ExtIncFile.findOne({ where: { file: file.filename } })
          break

        case 'extOutFile':
          message = await extOutFile.addExtOutFile(null, { extOutFile: { file: file.filename } })
          f = await Docs.ExtOutFile.findOne({ where: { file: file.filename } })
          break

        case 'intIncFile':
          message = await intIncFile.addIntIncFile(null, { intIncFile: { file: file.filename } })
          f = await Docs.IntIncFile.findOne({ where: { file: file.filename } })
          break

        case 'intOutFile':
          message = await intOutFile.addIntOutFile(null, { intOutFile: { file: file.filename } })
          f = await Docs.IntOutFile.findOne({ where: { file: file.filename } })
          break

        case 'internalFile':
          message = await internalFile.addInternalFile(null, { internalFile: { file: file.filename } })
          f = await Docs.InternalFile.findOne({ where: { file: file.filename } })
          break
      }
      response.push({
        id: f.id,
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        message
      })
    }
    const data = JSON.stringify(response)
    res.json(data)
    res.end()
  } catch (err) {
    throw err
  }
})

module.exports = router
