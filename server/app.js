const consola = require('consola')
const passport = require('passport')
const bcrypt = require('bcrypt')

const fastify = require('fastify')
const fastifySession = require('fastify-session')
const fastifyCookie = require('fastify-cookie')
const multer = require('fastify-multer')

const passportStrategy = require('./middleware/passport-strategy')
const Auth = require('./models/auth')
const keys = require('./keys')
const dbAuth = require('./db/auth')
const dbDocs = require('./db/docs')
const dbOld = require('./db/old')
const fileMiddleware = require('./middleware/file')
const fileHandler = require('./routes/upload')
// const SessionStore = require('./session-store/session-store')

// ----------------------------------------------
const app = fastify()

function extendDefaultFields (defaults, session) {
  return {
    data: defaults.data,
    expires: defaults.expires,
    UserId: session.userId
  }
}

async function userInit () {
  try {
    const users = await Auth.User.findAll() || {}
    if (!users.length) {
      const salt = await bcrypt.genSalt(10)
      const initGroup = await Auth.Group.create({
        name: 'Администратор',
        permissions: 255
      })
      const initUser = await Auth.User.create({
        name: 'administrator',
        password: await bcrypt.hash('administrator', salt)
      })
      await initUser.setGroups([initGroup])
      consola.info('Инициирующий пользователь успешно создан')
    } else {
      consola.info('Пользователи уже существуют')
    }
  } catch (err) {
    throw err
  }
}

// ----------------------------------------------
// Подключение middleware
app.register(fastifyCookie)
app.register(fastifySession, {
  cookieName: 'sessionId',
  secret: keys.SESSION_KEY + keys.SESSION_KEY,
  cookie: { secure: false },
  expires: 4 * 60 * 60 * 1000
})

// app.use(fileMiddleware.any())
app.register(passport.initialize())
passport.use(passportStrategy)
// ----------------------------------------------
// Регистрация роутов
app.register(multer.contentParser)
app.route({
  method: 'POST',
  url: '/upload',
  preHandler: fileMiddleware.any(),
  handler: fileHandler
})

// ----------------------------------------------
dbAuth.sync()
dbAuth
  .authenticate()
  .then(() => {
    consola.success('Подключение к БД аутентификации успешно установлено.')
  })
  .catch((err) => {
    consola.error('Неудаётся подключиться к БД аутентификации:', err)
  })
  .then(userInit)
// ----------------------------------------------
// dbDocs.sync({ force: true })
dbDocs.sync({ alter: true })
// dbDocs.sync()
dbDocs
  .authenticate()
  .then(() => {
    consola.success('Подключение к БД документооборота успешно установлено.')
  })
  .catch((err) => {
    consola.error('Неудаётся подключиться к БД документооборота:', err)
  })
dbOld.sync({ alter: true })
dbOld
  .authenticate()
  .then(() => {
    consola.success('Подключение к старой БД успешно установлено.')
  })
  .catch((err) => {
    consola.error('Неудаётся подключиться к старой БД:', err)
  })
  .then(() => {
    setTimeout(() => {
      // importFromOldBase.importVxFromOldBase()
      // importFromOldBase.syncIncNums()
      // importFromOldBase.importIsFromOldBase()

      // correctBase.findAndCorrectExtOut()
      // correctBase.findAndCorrectIntOut()
    }, 18000)
  })
// ----------------------------------------------
// Экспорт модуля
module.exports = app
