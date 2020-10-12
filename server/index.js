// Корневой файл сервера
// ----------------------------------------------
// Подключение модулей
const http = require('http')
const { ApolloServer } = require('apollo-server-express')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('graphql-tools')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
// ----------------------------------------------
const config = require('../nuxt.config.js')
const schema = require('./graphql/schema')
const { timeStamp, time, date } = require('./graphql/types')
const apolloRes = require('./graphql/resolver/apollo-resolver')
// const keys = require('./keys')

// Импорт настроек и установка их в Nuxt.js
config.dev = process.env.NODE_ENV !== 'production'
// ----------------------------------------------

const app = require('./app')
// ----------------------------------------------

const Schema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: apolloRes
})
// console.log(schema.raw)
Object.assign(Schema._typeMap.TimeStamp, timeStamp)
Object.assign(Schema._typeMap.Time, time)
Object.assign(Schema._typeMap.Date, date)

const apolloServer = new ApolloServer({
  schema: Schema,
  context: ({ req, res }) => ({ req, res }),
  introspection: true,
  playground: true
})

apolloServer.applyMiddleware({ app })

// Функция запуска сервера
async function start () {
  // Инициализация Nuxt.js
  const nuxt = new Nuxt(config)
  const { host, port } = nuxt.options.server
  // ----------------------------------------------
  // Сборка только для режима разработчика
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  // ----------------------------------------------
  // Подключение middleware
  app.use(nuxt.render)
  // ----------------------------------------------
  const server = http.createServer(app)
  // Запуск сервера
  const connections = new Map()

  server.listen(port, host, () => {
    const subscriptionServer = new SubscriptionServer(
      {
        schema: Schema,
        execute,
        subscribe
      },
      {
        server,
        path: '/graphql'
      }
    )
    consola.ready({
      message: `Сервер запущен на http://${host}:${port}`,
      badge: true
    })
  })
  server.on('connection', (socket) => {
    const key = `${socket.remoteAddress}:${socket.remotePort} (${socket.remoteFamily})`
    connections.set(key, socket)
    socket.on('close', () => {
      connections.delete(key)
      console.log(`Соединение ${key} закрыто.`)
    })
    console.log(connections.keys())
  })
}
// ----------------------------------------------
start()
