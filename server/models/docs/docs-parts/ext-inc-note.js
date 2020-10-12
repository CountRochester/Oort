module.exports = (dbDocs, DataTypes) => {
  const ExtIncNote = dbDocs.define('ExtIncNote', {
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

  return ExtIncNote
}
