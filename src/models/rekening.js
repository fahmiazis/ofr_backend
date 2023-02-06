'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class rekening extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  rekening.init({
    kode_plant: DataTypes.STRING,
    rek_spending: DataTypes.STRING,
    rek_zba: DataTypes.STRING,
    rek_bankcol: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'rekening'
  })
  return rekening
}
