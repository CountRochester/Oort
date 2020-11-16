/* eslint-disable no-template-curly-in-string */
import path from 'path'
import fs from 'fs'

const OUTPUT_DIR = '.output'

const rootDir = path.resolve(path.parse('').dir)

// Создание дирректории, если её нет
function makeOutputDir (dirName) {
  try {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName)
    }
  } catch (err) {
    console.log(err)
  }
}

// Очистка дирректории, если не пуста
function truncateDir (dirName) {
  try {
    const files = fs.readdirSync(dirName)
    for (const file of files) {
      const filePath = path.join(dirName, file)
      const fileStat = fs.lstatSync(filePath)
      if (fileStat.isDirectory()) {
        truncateDir(filePath)
        fs.rmdirSync(filePath)
      } else {
        fs.unlinkSync(filePath)
      }
    }
  } catch (err) {
    console.log(err)
  }
}
// Перемещение нужных файлов между дирректориями
function translateFiles (sourceDir, destDir, mode, nested) {
  mode = ['copy', 'move'].includes(mode) ? mode : null
  if (!mode) {
    console.log('Неверный режим')
    return
  }
  const moveFunc = mode === 'copy'
    ? 'copyFileSync'
    : 'renameSync'
  try {
    if (!fs.existsSync(sourceDir) || !fs.existsSync(destDir)) {
      console.log('Путь не существует')
      return
    }
    const files = fs.readdirSync(sourceDir)
    for (const file of files) {
      const filePath = path.join(sourceDir, file)
      const fileDestPath = path.join(destDir, file)
      const fileStat = fs.lstatSync(filePath)
      if (fileStat.isDirectory()) {
        if (nested) {
          makeOutputDir(fileDestPath)
          translateFiles(filePath, fileDestPath, mode)
          if (mode === 'move') {
            fs.rmdirSync(filePath)
          }
        }
      } else {
        fs[moveFunc](filePath, fileDestPath)
      }
    }
  } catch (err) {
    console.log(err)
  }
}

function copyFiles () {
  const destDir = path.join(rootDir, OUTPUT_DIR)
  try {
    makeOutputDir(destDir)
    truncateDir(destDir)
    console.log('Подготовка папки назначения: ОК')
    makeOutputDir(path.join(destDir, '.nuxt'))
    makeOutputDir(path.join(destDir, 'server'))
    makeOutputDir(path.join(destDir, 'static'))
    makeOutputDir(path.join(destDir, 'assets'))
    console.log('Создание папок: ОК')
    translateFiles(path.join(rootDir, '.nuxt'), path.join(destDir, '.nuxt'), 'copy', true)
    console.log('Копирование папки .nuxt: ОК')
    translateFiles(path.join(rootDir, 'server'), path.join(destDir, 'server'), 'copy', true)
    console.log('Копирование папки server: ОК')
    translateFiles(path.join(rootDir, 'static'), path.join(destDir, 'static'), 'copy', true)
    console.log('Копирование папки static: ОК')
    translateFiles(path.join(rootDir, 'assets'), path.join(destDir, 'assets'), 'copy', true)
    console.log('Копирование папки assets: ОК')
    translateFiles(rootDir, destDir, 'copy')
    console.log('Копирование файлов из корневой папки: ОК')
  } catch (err) {
    console.error(err)
  }
}

function removeComments (fileContent) {
  const contentWithoutComments = fileContent.replace(/\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//gm, '')
  const output = contentWithoutComments.replace(/(?<!:)\/(\/)[^\n]*$/gm, '')
  return output
}

function fixConfigContent (fileContent) {
  return fileContent.replace(/wsEndpoint:[^\n]* /, "wsEndpoint: 'ws://192.168.40.63/graphql',")
}

function prepareNuxtConfig () {
  const filePath = path.join(rootDir, 'nuxt.config.js')
  const destFilePath = path.join(rootDir, OUTPUT_DIR, 'nuxt.config.js')
  const sourceFileDescriptor = fs.openSync(filePath)
  const destFileDescriptor = fs.openSync(destFilePath, 'w+')
  const fileContent = fs.readFileSync(sourceFileDescriptor, { encoding: 'utf-8' })
  const contentWithoutComments = fixConfigContent(removeComments(fileContent))
  fs.writeFileSync(destFileDescriptor, contentWithoutComments)
  fs.closeSync(sourceFileDescriptor)
  fs.closeSync(destFileDescriptor)
}

function prepareWorker () {
  const filePath = path.join(rootDir, OUTPUT_DIR, 'static/workers/sync.js')
  let fileDescriptor = fs.openSync(filePath)
  const fileContent = fs.readFileSync(fileDescriptor, { encoding: 'utf-8' })
  fs.closeSync(fileDescriptor)
  fileDescriptor = fs.openSync(filePath, 'w+')
  const find = 'http://${location.hostname}:${location.port || 3000}/graphql'
  const replace = 'http://${HOSTNAME}:${PORT}/graphql'
  const newFileContent = fileContent.replace(find, replace)
  fs.writeFileSync(fileDescriptor, newFileContent)
  fs.closeSync(fileDescriptor)
}

function prepareDeployDistrib () {
  try {
    console.time('Дистрибутив для разворачивания приложения готов')
    console.log('Подготовка дистрибутива для разворачивания приложения')
    console.log('Начало копирования файлов')
    copyFiles()
    console.log('Файлы успешно скопированы')
    console.log('Внесение изменений в статические файлы')
    prepareNuxtConfig()
    prepareWorker()
    console.timeEnd('Дистрибутив для разворачивания приложения готов')
  } catch (err) {
    console.error(err)
  }
}

prepareDeployDistrib()
