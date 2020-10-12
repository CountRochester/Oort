module.exports = (dbDocs, DataTypes) => {
  const InternalIncState = dbDocs.define('InternalIncState', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  })

  return InternalIncState
}
