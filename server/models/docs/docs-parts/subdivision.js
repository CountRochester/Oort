module.exports = (dbDocs, DataTypes) => {
  const Subdivision = dbDocs.define('Subdivision', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Название должности
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    }
  })

  return Subdivision
}
