'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class config_transaksi_area extends Model {
    static associate (models) {
      config_transaksi_area.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'finance'
      })
    }
  }
  config_transaksi_area.init({
    id_config: DataTypes.INTEGER,
    kode_plant: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'config_transaksi_area'
  })
  return config_transaksi_area
}
