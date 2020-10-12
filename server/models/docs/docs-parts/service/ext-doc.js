module.exports = (dbDocs, DataTypes) => {
  const ExtDoc = dbDocs.define('ExtDoc', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtDoc
}
