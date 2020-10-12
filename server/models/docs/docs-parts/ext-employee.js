module.exports = (dbDocs, DataTypes) => {
  const ExtEmployee = dbDocs.define('ExtEmployee', {
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
      allowNull: true
    },
    // Отчество
    middleName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone1: {
      type: DataTypes.STRING
    },
    phone2: {
      type: DataTypes.STRING
    },
    fax: {
      type: DataTypes.STRING
    },
    email1: {
      type: DataTypes.STRING
    },
    email2: {
      type: DataTypes.STRING
    }
  })

  return ExtEmployee
}
