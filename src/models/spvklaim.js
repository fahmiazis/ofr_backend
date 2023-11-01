'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class spvklaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
    }
  }
  spvklaim.init({
    pic_klaim: DataTypes.STRING,
    spv_klaim: DataTypes.STRING,
    manager_klaim: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'spvklaim'
  })
  return spvklaim
}
