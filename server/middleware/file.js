const multer = require('multer')
const { v1: uuidv1 } = require('uuid')
// const keys = require('../keys')

const storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, 'static/file-storage/upload')
  },
  filename (req, file, cb) {
    cb(null, uuidv1() + '-' + file.originalname)
  }
})

const allowedTypes = [
  'application/pdf',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/octet-stream',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/x-rar-compressed'
]

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

module.exports = multer({
  storage,
  fileFilter
})
