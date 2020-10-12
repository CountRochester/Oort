module.exports = (dbDocs, DataTypes) => {
  const ExtCurrentPosition = dbDocs.define('ExtCurrentPosition', {
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
    ExtEmployeeId: {
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
    OrganisationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false
    }
  })

  return ExtCurrentPosition
}
