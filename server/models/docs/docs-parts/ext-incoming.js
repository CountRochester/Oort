// Модель внешнего входящего документа
module.exports = (dbDocs, DataTypes) => {
  const ExtIncoming = dbDocs.define('ExtIncoming', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Краткое содержание
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Исходящий номер
    extNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Дата исходящего
    extDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Требуется ответ
    needAnswer: {
      type: DataTypes.BOOLEAN
    }
  })

  return ExtIncoming
}
