module.exports = (dbDocs, DataTypes) => {
  const Position = dbDocs.define('Position', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Название должности
    posName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Название должности в дательном падеже
    posNameDat: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Может подписывать внешние документы
    canSignExtDocs: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      unique: false
    },
    // Может подписывать внутренние документы
    canSignIntDocs: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      unique: false
    }
  })

  return Position
}
