// Модель группы
// ----------------------------------------------
// Подключение модулей
const Sequelize = require('sequelize')
const dbAuth = require('../../../db/auth')

// ----------------------------------------------

const Group = dbAuth.define('Group', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequelize.INTEGER
  },
  name: {
    allowNull: false,
    unique: true,
    type: Sequelize.STRING
  },
  permissions: {
    allowNull: true,
    unique: false,
    type: Sequelize.INTEGER
  }
})

module.exports = Group
