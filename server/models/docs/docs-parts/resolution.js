// Модель внешнего входящего документа
module.exports = (dbDocs, DataTypes) => {
  const Resolution = dbDocs.define('Resolution', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Резолюция
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Срок
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Исполнена ли резолюция
    complete: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  })

  return Resolution
}
