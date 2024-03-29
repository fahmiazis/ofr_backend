'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ikk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      ikk.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appForm',
        sourceKey: 'no_transaksi'
      })
      ikk.hasMany(models.ttd, {
        foreignKey: 'no_transaksi',
        as: 'appList',
        sourceKey: 'no_pembayaran'
      })
      ikk.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
      ikk.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'finance'
      })
      ikk.hasOne(models.finance, {
        foreignKey: 'rek_spending',
        sourceKey: 'norek_ajuan',
        as: 'spending'
      })
      ikk.hasOne(models.kliring, {
        foreignKey: 'nama_singkat',
        sourceKey: 'bank_tujuan',
        as: 'kliring'
      })
      ikk.hasOne(models.veriftax, {
        foreignKey: 'gl_account',
        sourceKey: 'no_coa',
        as: 'veriftax'
      })
      ikk.hasOne(models.taxcode, {
        foreignKey: 'tax_code',
        sourceKey: 'tax_code',
        as: 'taxcode'
      })
    }
  }
  ikk.init({
    no_coa: DataTypes.STRING,
    nama_coa: DataTypes.STRING,
    sub_coa: DataTypes.STRING,
    cost_center: DataTypes.STRING,
    uraian: DataTypes.STRING,
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
    start_ikk: DataTypes.DATE,
    end_ikk: DataTypes.DATE,
    end_proses: DataTypes.DATE,
    history: DataTypes.TEXT,
    menu_rev: DataTypes.STRING,
    menu_proses: DataTypes.STRING,
    tujuan_tf: DataTypes.STRING,
    tiperek: DataTypes.STRING,
    no_pembayaran: DataTypes.STRING,
    bank_transfer: DataTypes.STRING,
    tipe_nodoc: DataTypes.STRING,
    nodoc: DataTypes.STRING,
    alamat: DataTypes.STRING,
    user_nama: DataTypes.STRING,
    user_jabatan: DataTypes.STRING,
    nama_vendor: DataTypes.STRING,
    jenis_vendor: DataTypes.STRING,
    alamat_vendor: DataTypes.STRING,
    penanggung_pajak: DataTypes.STRING,
    type_transaksi: DataTypes.STRING,
    no_faktur: DataTypes.STRING,
    dpp: DataTypes.STRING,
    ppn: DataTypes.STRING,
    nilai_buku: DataTypes.STRING,
    nilai_utang: DataTypes.STRING,
    nilai_vendor: DataTypes.STRING,
    jenis_pph: DataTypes.STRING,
    tgl_tagihanbayar: DataTypes.DATE,
    no_bpkk: DataTypes.STRING,
    type_topup: DataTypes.STRING,
    nilai_topup: DataTypes.STRING,
    tgl_topup: DataTypes.STRING,
    bank_topup: DataTypes.STRING,
    no_bbk: DataTypes.STRING,
    saldo_awal: DataTypes.STRING,
    saldo_akhir: DataTypes.STRING,
    kasbon: DataTypes.STRING,
    saldo_akhirtunai: DataTypes.STRING,
    tgl_faktur: DataTypes.DATE,
    tgl_fullarea: DataTypes.DATE,
    tgl_veriffin: DataTypes.DATE,
    tgl_veriftax: DataTypes.DATE,
    tgl_sublist: DataTypes.DATE,
    tgl_fullsublist: DataTypes.DATE,
    typeniknpwp: DataTypes.STRING,
    new_ident: DataTypes.STRING,
    people_reject: DataTypes.STRING,
    flag_redpine: DataTypes.INTEGER,
    tax_type: DataTypes.STRING,
    tax_code: DataTypes.STRING,
    nilai_verif: DataTypes.STRING,
    type_nilaiverif: DataTypes.STRING,
    tgl_submitbukti: DataTypes.DATE,
    tgl_getdana: DataTypes.DATE,
    stat_skb: DataTypes.TEXT,
    stat_skt: DataTypes.TEXT,
    datef_skb: DataTypes.DATE,
    datel_skb: DataTypes.DATE,
    no_skb: DataTypes.TEXT,
    no_pol: DataTypes.TEXT,
    nominal_bbm: DataTypes.TEXT,
    liter: DataTypes.TEXT,
    km: DataTypes.TEXT,
    stat_bbm: DataTypes.TEXT,
    status_download: DataTypes.INTEGER,
    id_pelanggan: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ikk'
  })
  return ikk
}
