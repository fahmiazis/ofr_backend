'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class veriftax extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      veriftax.hasOne(models.taxcode, {
        foreignKey: 'tax_code',
        sourceKey: 'tax_code',
        as: 'taxcode'
      })
    }
  }
  veriftax.init({
    system: DataTypes.STRING,
    gl_account: DataTypes.STRING,
    gl_name: DataTypes.STRING,
    jenis_transaksi: DataTypes.STRING,
    type_transaksi: DataTypes.STRING,
    jenis_pph: DataTypes.STRING,
    status_npwp: DataTypes.STRING,
    tarif_pph: DataTypes.STRING,
    dpp_nongrossup: DataTypes.STRING,
    dpp_grossup: DataTypes.STRING,
    status_ident: DataTypes.STRING,
    tax_type: DataTypes.STRING,
    tax_code: DataTypes.STRING,
    grouping: DataTypes.STRING,
    gl_jurnal: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'veriftax'
  })
  return veriftax
}
