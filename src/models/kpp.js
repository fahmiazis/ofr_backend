'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class kpp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  kpp.init({
    system: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    area: DataTypes.STRING,
    npwp: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kpp'
  })
  return kpp
}
