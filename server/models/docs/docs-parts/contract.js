module.exports = (dbDocs, DataTypes) => {
  const Contract = dbDocs.define('Contract', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Номер контракта
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Дата контракта
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })

  return Contract
}
