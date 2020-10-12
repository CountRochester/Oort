module.exports = (dbDocs, DataTypes) => {
  const IncomingNumber = dbDocs.define('IncomingNumber', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Номер входящего внешнего документа
    incNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false
    },
    // Дата входящего внешнего документа
    incDate: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: false
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    }
  })

  return IncomingNumber
}
