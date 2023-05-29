'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class klaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      klaim.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appForm',
        sourceKey: 'no_transaksi'
      })
      klaim.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appList',
        sourceKey: 'no_pembayaran'
      })
      klaim.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
    }
  }
  klaim.init({
    no_coa: DataTypes.STRING,
    sub_coa: DataTypes.STRING,
    cost_center: DataTypes.STRING,
    nama_coa: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    periode: DataTypes.STRING,
    nilai_ajuan: DataTypes.STRING,
    bank_tujuan: DataTypes.STRING,
    norek_ajuan: DataTypes.STRING,
    nama_tujuan: DataTypes.STRING,
    status_npwp: DataTypes.INTEGER,
    nama_npwp: DataTypes.STRING,
    no_npwp: DataTypes.STRING,
    ppu: DataTypes.STRING,
    pa: DataTypes.STRING,
    nominal: DataTypes.STRING,
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
    no_ktp: DataTypes.STRING,
    start_klaim: DataTypes.DATE,
    end_klaim: DataTypes.DATE,
    end_proses: DataTypes.DATE,
    history: DataTypes.TEXT,
    menu_rev: DataTypes.STRING,
    menu_proses: DataTypes.STRING,
    tujuan_tf: DataTypes.STRING,
    tiperek: DataTypes.STRING,
    no_pembayaran: DataTypes.STRING,
    bank_transfer: DataTypes.STRING,
    tgl_fullarea: DataTypes.DATE,
    tgl_veriffin: DataTypes.DATE,
    tgl_verifklm: DataTypes.DATE,
    tgl_sublist: DataTypes.DATE,
    tgl_fullsublist: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'klaim'
  })
  return klaim
}
