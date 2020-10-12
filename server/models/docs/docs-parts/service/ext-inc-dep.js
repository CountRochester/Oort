module.exports = (dbDocs, DataTypes) => {
  const ExtIncDep = dbDocs.define('ExtIncDep', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtIncDep
}
