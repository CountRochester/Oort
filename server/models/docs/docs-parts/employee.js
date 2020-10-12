module.exports = (dbDocs, DataTypes) => {
  const Employee = dbDocs.define('Employee', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Имя
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Фамилия
    secondName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Фамилия в дательном падеже
    secondNameDat: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Отчество
    middleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Табельный номер
    tabelNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Телефон
    phone1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Телефон
    phone2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Телефон
    phone3: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Email
    email1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Email
    email2: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  return Employee
}
