'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class taxcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  taxcode.init({
    tax_type: DataTypes.STRING,
    tax_code: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    stat_npwp: DataTypes.STRING,
    kode_obpajak: DataTypes.STRING,
    tax_objdesc: DataTypes.STRING,
    pph: DataTypes.STRING,
    income: DataTypes.STRING,
    tax_base: DataTypes.STRING,
    tarif_asis: DataTypes.STRING,
    transaksi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'taxcode'
  })
  return taxcode
}
