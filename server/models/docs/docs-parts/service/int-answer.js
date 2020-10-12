module.exports = (dbDocs, DataTypes) => {
  const IntAnswer = dbDocs.define('IntAnswer', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntAnswer
}
