module.exports = (dbDocs, DataTypes) => {
  const CurrentPosition = dbDocs.define('CurrentPosition', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    // Дата вступления в должность
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      unique: false
    },
    // Дата перевода
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      unique: false
    },
    // Ссылка на служащего
    EmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false
    },
    // Ссылка на должность
    PositionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false
    },
    // Ссылка на отдел
    DepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false
    },
    // Допоплнительный префикс во внешнем документе
    extPrefix: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    },
    // Допоплнительный префикс во внутреннем документе
    intPrefix: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    }
  })

  return CurrentPosition
}
