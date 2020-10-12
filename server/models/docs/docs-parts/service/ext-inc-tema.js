module.exports = (dbDocs, DataTypes) => {
  const ExtIncTema = dbDocs.define('ExtIncTema', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtIncTema
}
