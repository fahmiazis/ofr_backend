'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class coa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  coa.init({
    no_coa: DataTypes.STRING,
    nama_coa: DataTypes.STRING,
    sub_coa: DataTypes.STRING,
    nama_subcoa: DataTypes.STRING,
    tipe: DataTypes.STRING,
    flagdata: DataTypes.STRING,
    status_ident: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'coa'
  })
  return coa
}
