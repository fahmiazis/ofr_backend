'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class finance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  finance.init({
    kode_plant: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    region: DataTypes.STRING,
    inisial: DataTypes.STRING,
    pic_console: DataTypes.STRING,
    rek_spending: DataTypes.STRING,
    rek_zba: DataTypes.STRING,
    rek_bankcoll: DataTypes.STRING,
    rekening: DataTypes.STRING,
    type_live: DataTypes.STRING,
    gl_kk: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'finance'
  })
  return finance
}
