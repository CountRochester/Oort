module.exports = (dbDocs, DataTypes) => {
  const Tema = dbDocs.define('Tema', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Название темы
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  })

  return Tema
}
