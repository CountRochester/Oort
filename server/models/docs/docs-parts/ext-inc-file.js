module.exports = (dbDocs, DataTypes) => {
  const ExtIncFile = dbDocs.define('ExtIncFile', {
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

  return ExtIncFile
}
