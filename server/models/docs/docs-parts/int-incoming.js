// Модель внутреннего входящего документа
module.exports = (dbDocs, DataTypes) => {
  const IntIncoming = dbDocs.define('IntIncoming', {
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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    extNumberPrefix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Дата исходящего
    extDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Требуется ответ
    needAnswer: {
      type: DataTypes.BOOLEAN
    }
  })

  return IntIncoming
}
