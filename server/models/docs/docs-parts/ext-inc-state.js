module.exports = (dbDocs, DataTypes) => {
  const ExtIncState = dbDocs.define('ExtIncState', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtIncState
}
