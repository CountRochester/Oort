module.exports = (dbDocs, DataTypes) => {
  const ExtOutDoc = dbDocs.define('ExtOutDoc', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtOutDoc
}
