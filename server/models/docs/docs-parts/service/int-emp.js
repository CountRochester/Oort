module.exports = (dbDocs, DataTypes) => {
  const IntEmp = dbDocs.define('IntEmp', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntEmp
}
