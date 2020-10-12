module.exports = (dbDocs, DataTypes) => {
  const ExtAnswer = dbDocs.define('ExtAnswer', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtAnswer
}
