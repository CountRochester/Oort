module.exports = (dbDocs, DataTypes) => {
  const ExtOutEmp = dbDocs.define('ExtOutEmp', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ExtOutEmp
}
