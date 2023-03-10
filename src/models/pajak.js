'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class pajak extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      pajak.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appForm',
        sourceKey: 'no_transaksi'
      })
    }
  }
  pajak.init({
    no_coa: DataTypes.STRING,
    sub_coa: DataTypes.STRING,
    cost_center: DataTypes.STRING,
    nama_coa: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    periode: DataTypes.DATE,
    nilai_ajuan: DataTypes.STRING,
    bank_tujuan: DataTypes.STRING,
    norek_ajuan: DataTypes.STRING,
    nama_tujuan: DataTypes.STRING,
    status_npwp: DataTypes.INTEGER,
    nama_npwp: DataTypes.STRING,
    no_npwp: DataTypes.STRING,
    dpp: DataTypes.STRING,
    ppn: DataTypes.STRING,
    pph: DataTypes.STRING,
    jenis_pph: DataTypes.STRING,
    nilai_bayar: DataTypes.STRING,
    tanggal_transfer: DataTypes.DATE,
    status_transaksi: DataTypes.INTEGER,
    status_reject: DataTypes.INTEGER,
    status_approve: DataTypes.STRING,
    isreject: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    area: DataTypes.STRING,
    periode_awal: DataTypes.DATE,
    periode_akhir: DataTypes.DATE,
    nama_ktp: DataTypes.STRING,
    no_ktp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pajak'
  })
  return pajak
}
