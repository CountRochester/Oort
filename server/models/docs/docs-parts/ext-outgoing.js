module.exports = (dbDocs, DataTypes) => {
  const ExtOutgoing = dbDocs.define('ExtOutgoing', {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    // Дата исходящего
    outDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Краткое содержание
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Префикс
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

  return ExtOutgoing
}
