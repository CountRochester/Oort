// Модель внутреннего документа
module.exports = (dbDocs, DataTypes) => {
  const Internal = dbDocs.define('Internal', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Входящий номер по учёту
    incNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Дата входящего
    incDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Входящий номер по учёту
    docNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Дата входящего
    docDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Краткое содержание
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    docNumberPrefix: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return Internal
}
