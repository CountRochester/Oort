// Серверное приложение
// ----------------------------------------------
// Подключение модулей
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const consola = require('consola')

// const SequelizeStore = require('connect-session-sequelize')(session.Store)
const passport = require('passport')
const bcrypt = require('bcrypt')

const passportStrategy = require('./middleware/passport-strategy')
const Auth = require('./models/auth')
const keys = require('./keys')
const dbAuth = require('./db/auth')
const dbDocs = require('./db/docs')
const dbOld = require('./db/old')
const fileMiddleware = require('./middleware/file')
// const authGQL = require('./middleware/auth')
const upload = require('./routes/upload')
// const SessionStore = require('./session-store/session-store')(session.Store)
const SessionStore = require('./session-store/session-store')
const fastify = require('fastify')

// ----------------------------------------------
// const app = express()
const app = fastify()

// function extendDefaultFields (defaults, session) {
//   return {
//     data: defaults.data,
//     expires: defaults.expires,
//     UserId: session.userId
//   }
// }

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

// const sessionOptions = {
//   secret: keys.SESSION_KEY,
//   resave: false,
//   saveUninitialized: false,
//   proxy: false,
//   checkExpirationInterval: 30 * 60 * 1000,
//   expiration: 4 * 60 * 60 * 1000,
//   store: new SequelizeStore({
//     db: dbAuth,
//     table: 'Session',
//     tableName: 'Session',
//     extendDefaultFields
//   })
// }
// const sessionConfig = session({
//   secret: keys.SESSION_KEY,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: false,
//     maxAge: 4 * 60 * 60 * 1000,
//     store: new SessionStore({
//       db: dbAuth,
//       table: 'Session',
//       tableName: 'Session',
//       extendDefaultFields
//     })
//   }
// })
const sessionConfig = session({
  secret: keys.SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  store: SessionStore,
  cookie: {
    secure: false,
    maxAge: 4 * 60 * 60 * 1000
  }
})
// ----------------------------------------------
// Подключение middleware
// app.use(session(sessionOptions))

// app.use(sessionConfig)
// app.use(fileMiddleware.any())
// app.use(passport.initialize())
// passport.use(passportStrategy)
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

// app.use('/graphql', authGQL)

// ----------------------------------------------
// Регистрация роутов
// app.use('/upload', upload)

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
