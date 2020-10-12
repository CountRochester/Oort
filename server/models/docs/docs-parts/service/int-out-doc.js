module.exports = (dbDocs, DataTypes) => {
  const IntOutDoc = dbDocs.define('IntOutDoc', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntOutDoc
}
