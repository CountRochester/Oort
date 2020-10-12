module.exports = (dbDocs, DataTypes) => {
  const IntOutTema = dbDocs.define('IntOutTema', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntOutTema
}
