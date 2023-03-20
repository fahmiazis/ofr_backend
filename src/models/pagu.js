'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class pagu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  pagu.init({
    profit_center: DataTypes.STRING,
    area: DataTypes.STRING,
    pagu: DataTypes.STRING,
    history: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pagu'
  })
  return pagu
}
