'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vervendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      vervendor.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
    }
  }
  vervendor.init({
    no_transaksi: DataTypes.STRING,
    nama: DataTypes.STRING,
    npwp: DataTypes.STRING,
    nik: DataTypes.STRING,
    alamat: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    status_transaksi: DataTypes.INTEGER,
    tipe_ajuan: DataTypes.STRING,
    status_reject: DataTypes.INTEGER,
    isReject: DataTypes.INTEGER,
    start_transaksi: DataTypes.DATE,
    end_transaksi: DataTypes.DATE,
    tgl_verif: DataTypes.DATE,
    history: DataTypes.TEXT,
    datef_skb: DataTypes.DATE,
    datel_skb: DataTypes.DATE,
    no_skb: DataTypes.TEXT,
    no_skt: DataTypes.STRING,
    type_skb: DataTypes.STRING,
    jenis_vendor: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'vervendor'
  })
  return vervendor
}
