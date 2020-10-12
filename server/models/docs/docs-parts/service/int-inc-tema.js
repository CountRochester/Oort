module.exports = (dbDocs, DataTypes) => {
  const IntIncTema = dbDocs.define('IntIncTema', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntIncTema
}
