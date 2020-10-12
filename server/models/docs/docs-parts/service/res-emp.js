module.exports = (dbDocs, DataTypes) => {
  const ResEmp = dbDocs.define('ResEmp', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ResEmp
}
