// Модель пользователя
// ----------------------------------------------
// Подключение модулей
const Sequelize = require('sequelize')
const dbAuth = require('../../../db/auth')

// ----------------------------------------------

const session = dbAuth.define('Session', {
  // sid: {
  //   primaryKey: true,
  //   allowNull: false,
  //   type: Sequelize.STRING
  // },
  // sess: {
  //   allowNull: false,
  //   type: Sequelize.JSON
  // },
  // expire: {
  //   allowNull: false,
  //   type: Sequelize.DATE
  // }
  sid: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  UserId: Sequelize.INTEGER,
  expires: Sequelize.DATE,
  data: Sequelize.STRING(50000)
})

module.exports = session
