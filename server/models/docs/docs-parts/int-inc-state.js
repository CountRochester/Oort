module.exports = (dbDocs, DataTypes) => {
  const IntIncState = dbDocs.define('IntIncState', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntIncState
}
