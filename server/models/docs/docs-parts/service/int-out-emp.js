module.exports = (dbDocs, DataTypes) => {
  const IntOutEmp = dbDocs.define('IntOutEmp', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return IntOutEmp
}
