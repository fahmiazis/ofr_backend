'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class outlet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  outlet.init({
    klaimId: DataTypes.INTEGER,
    no_transaksi: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    nilai_ajuan: DataTypes.STRING,
    status_npwp: DataTypes.INTEGER,
    nama_npwp: DataTypes.STRING,
    no_npwp: DataTypes.STRING,
    nama_ktp: DataTypes.STRING,
    no_ktp: DataTypes.STRING,
    no_dn: DataTypes.STRING,
    status: DataTypes.INTEGER,
    history: DataTypes.TEXT,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'outlet'
  })
  return outlet
}
