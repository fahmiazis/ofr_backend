'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ops extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      ops.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appForm',
        sourceKey: 'no_transaksi'
      })
      ops.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appList',
        sourceKey: 'no_pembayaran'
      })
      ops.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
      ops.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'finance'
      })
      ops.hasOne(models.finance, {
        foreignKey: 'rek_spending',
        sourceKey: 'norek_ajuan',
        as: 'spending'
      })
      ops.hasOne(models.kliring, {
        foreignKey: 'nama_singkat',
        sourceKey: 'bank_tujuan',
        as: 'kliring'
      })
      ops.hasOne(models.veriftax, {
        foreignKey: 'gl_account',
        sourceKey: 'no_coa',
        as: 'veriftax'
      })
      ops.hasOne(models.taxcode, {
        foreignKey: 'tax_code',
        sourceKey: 'tax_code',
        as: 'taxcode'
      })
    }
  }
  ops.init({
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
    no_ktp: DataTypes.STRING,
    start_ops: DataTypes.DATE,
    end_ops: DataTypes.DATE,
    end_proses: DataTypes.DATE,
    history: DataTypes.TEXT,
    menu_rev: DataTypes.STRING,
    menu_proses: DataTypes.STRING,
    tujuan_tf: DataTypes.STRING,
    tiperek: DataTypes.STRING,
    no_pembayaran: DataTypes.STRING,
    bank_transfer: DataTypes.STRING,
    nama_vendor: DataTypes.STRING,
    jenis_vendor: DataTypes.STRING,
    alamat_vendor: DataTypes.STRING,
    penanggung_pajak: DataTypes.STRING,
    type_transaksi: DataTypes.STRING,
    no_faktur: DataTypes.STRING,
    nilai_buku: DataTypes.STRING,
    nilai_utang: DataTypes.STRING,
    nilai_vendor: DataTypes.STRING,
    tgl_tagihanbayar: DataTypes.DATE,
    tgl_faktur: DataTypes.DATE,
    tgl_fullarea: DataTypes.DATE,
    tgl_veriffin: DataTypes.DATE,
    tgl_veriftax: DataTypes.DATE,
    tgl_sublist: DataTypes.DATE,
    tgl_fullsublist: DataTypes.DATE,
    typeniknpwp: DataTypes.STRING,
    new_ident: DataTypes.STRING,
    type_kasbon: DataTypes.STRING,
    type_po: DataTypes.STRING,
    no_po: DataTypes.STRING,
    people_reject: DataTypes.STRING,
    nilai_po: DataTypes.STRING,
    nilai_pr: DataTypes.STRING,
    stat_kasbon: DataTypes.STRING,
    tax_type: DataTypes.STRING,
    tax_code: DataTypes.STRING,
    nilai_verif: DataTypes.STRING,
    type_nilaiverif: DataTypes.STRING,
    tgl_submitbukti: DataTypes.DATE,
    tgl_getdana: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ops'
  })
  return ops
}
