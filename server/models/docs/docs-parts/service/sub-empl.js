module.exports = (dbDocs, DataTypes) => {
  const SubEmpl = dbDocs.define('SubEmpl', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return SubEmpl
}
