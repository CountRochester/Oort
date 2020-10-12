module.exports = (dbDocs, DataTypes) => {
  const IntOutgoing = dbDocs.define('IntOutgoing', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Исходящий номер
    outNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Дата исходящего
    outDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Краткое содержание
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    },
    // Примечание
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false
    }
  })

  return IntOutgoing
}
