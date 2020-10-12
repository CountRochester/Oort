module.exports = (dbDocs, DataTypes) => {
  const Department = dbDocs.define('Department', {
    // ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    depName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    depNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shortName: {
      type: DataTypes.STRING
    },
    depPrefix: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentDepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  })

  return Department
}
