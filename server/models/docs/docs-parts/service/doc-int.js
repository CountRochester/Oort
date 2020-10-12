module.exports = (dbDocs, DataTypes) => {
  const DocInt = dbDocs.define('DocInt', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return DocInt
}
