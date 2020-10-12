module.exports = (dbDocs, DataTypes) => {
  const IntIncEmp = dbDocs.define('IntIncEmp', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntIncEmp
}
