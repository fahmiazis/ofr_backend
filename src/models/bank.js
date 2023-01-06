'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  bank.init({
    name: DataTypes.STRING,
    digit: DataTypes.INTEGER,
    kode_bank: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'bank'
  })
  return bank
}
