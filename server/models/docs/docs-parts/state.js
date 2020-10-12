module.exports = (dbDocs, DataTypes) => {
  const State = dbDocs.define('State', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    }
  })

  return State
}
