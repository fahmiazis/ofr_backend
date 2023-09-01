'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class approve extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  approve.init({
    nama_approve: DataTypes.STRING,
    nama: DataTypes.STRING,
    jabatan: DataTypes.STRING,
    sebagai: DataTypes.STRING,
    kategori: DataTypes.STRING,
    jenis: DataTypes.STRING,
    status: DataTypes.STRING,
    access: DataTypes.STRING,
    tipe: DataTypes.STRING,
    kode_plant: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'approve'
  })
  return approve
}
