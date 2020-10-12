module.exports = (dbDocs, DataTypes) => {
  const InternalNote = dbDocs.define('InternalNote', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Примечание
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false
    }
  })

  return InternalNote
}
