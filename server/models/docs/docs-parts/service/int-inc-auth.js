module.exports = (dbDocs, DataTypes) => {
  const IntIncAuth = dbDocs.define('IntIncAuth', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntIncAuth
}
