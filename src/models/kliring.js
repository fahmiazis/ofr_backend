'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class kliring extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  kliring.init({
    nama: DataTypes.STRING,
    nama_singkat: DataTypes.STRING,
    bic: DataTypes.STRING,
    sandi_bank: DataTypes.STRING,
    sandi_usaha: DataTypes.STRING,
    sandi_kliring: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kliring'
  })
  return kliring
}
