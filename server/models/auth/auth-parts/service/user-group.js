// Модель группы
// ----------------------------------------------
// Подключение модулей
const Sequelize = require('sequelize')
const dbAuth = require('../../../../db/auth')

// ----------------------------------------------

const userGroup = dbAuth.define('userGroup', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequelize.INTEGER
  }
})

module.exports = userGroup
