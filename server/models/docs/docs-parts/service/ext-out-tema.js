module.exports = (dbDocs, DataTypes) => {
  const ExtOutTema = dbDocs.define('ExtOutTema', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtOutTema
}
