'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ttd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  ttd.init({
    jabatan: DataTypes.STRING,
    jenis: DataTypes.STRING,
    sebagai: DataTypes.STRING,
    kategori: DataTypes.STRING,
    nama: DataTypes.STRING,
    path: DataTypes.STRING,
    no_doc: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    status: DataTypes.STRING,
    reason: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ttd'
  })
  return ttd
}
