'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      user.hasOne(models.role, {
        foreignKey: 'level',
        as: 'role',
        sourceKey: 'level'
      })
    }
  }
  user.init({
    username: DataTypes.STRING,
    fullname: DataTypes.STRING,
    level: DataTypes.INTEGER,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    kode_plant: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user'
  })
  return user
}
