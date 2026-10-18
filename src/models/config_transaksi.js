'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class config_transaksi extends Model {
    static associate (models) {
      config_transaksi.hasMany(models.config_transaksi_area, {
        foreignKey: 'id_config',
        sourceKey: 'id',
        as: 'area'
      })
    }
  }
  config_transaksi.init({
    jenis_transaksi: DataTypes.STRING,
    // 'all' = semua area boleh mengajukan, 'area' = hanya area yang terdaftar
    tipe_akses: DataTypes.STRING,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'config_transaksi'
  })
  return config_transaksi
}
