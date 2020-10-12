module.exports = (dbDocs, DataTypes) => {
  const IntOutFile = dbDocs.define('IntOutFile', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Имя файла
    file: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  })

  return IntOutFile
}
