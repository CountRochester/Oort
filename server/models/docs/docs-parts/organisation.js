
module.exports = (dbDocs, DataTypes) => {
  const Organisation = dbDocs.define('Organisation', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Название организации
    orgName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Почтовый индекс
    postNumber: {
      type: DataTypes.STRING
    },
    // Город
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Область
    region: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Улица
    street: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Номер дома
    building: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Телефон
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Факс
    fax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Email
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return Organisation
}
