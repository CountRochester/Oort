module.exports = (dbDocs, DataTypes) => {
  const IntDoc = dbDocs.define('IntDoc', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntDoc
}
