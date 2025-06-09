'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class rekvendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  rekvendor.init({
    nik: DataTypes.STRING,
    npwp: DataTypes.STRING,
    bank: DataTypes.STRING,
    no_rekening: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'rekvendor'
  })
  return rekvendor
}
