// Модель пользователя
// ----------------------------------------------
// Подключение модулей
const Sequelize = require('sequelize')
const dbAuth = require('../../../db/auth')

// ----------------------------------------------

const User = dbAuth.define('User', {
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
  password: {
    allowNull: false,
    type: Sequelize.STRING
  },
  employeeId: {
    allowNull: true,
    type: Sequelize.INTEGER
  }
})

module.exports = User
