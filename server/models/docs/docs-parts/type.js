module.exports = (dbDocs, DataTypes) => {
  const Type = dbDocs.define('Type', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Имя типа документа
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  })

  return Type
}
