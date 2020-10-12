module.exports = (dbDocs, DataTypes) => {
  const ByWorker = dbDocs.define('ByWorker', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return ByWorker
}
