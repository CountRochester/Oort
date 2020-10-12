module.exports = (dbDocs, DataTypes) => {
  const InternalIncomingNumber = dbDocs.define('InternalIncomingNumber', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Номер входящего внутреннего документа
    incNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false
    },
    // Дата входящего внутреннего документа
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

  return InternalIncomingNumber
}
