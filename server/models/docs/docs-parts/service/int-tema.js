module.exports = (dbDocs, DataTypes) => {
  const IntTema = dbDocs.define('IntTema', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntTema
}
