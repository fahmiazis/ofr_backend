'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class finance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      finance.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
      finance.hasOne(models.kpp, {
        foreignKey: 'profit_center',
        sourceKey: 'profit_center',
        as: 'kpp'
      })
    }
  }
  finance.init({
    kode_plant: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    region: DataTypes.STRING,
    inisial: DataTypes.STRING,
    pic_console: DataTypes.STRING,
    rek_spending: DataTypes.STRING,
    rek_zba: DataTypes.STRING,
    rek_bankcoll: DataTypes.STRING,
    rekening: DataTypes.STRING,
    type_live: DataTypes.STRING,
    gl_kk: DataTypes.STRING,
    area: DataTypes.STRING,
    pagu: DataTypes.STRING,
    pic_finance: DataTypes.STRING,
    spv_finance: DataTypes.STRING,
    spv2_finance: DataTypes.STRING,
    asman_finance: DataTypes.STRING,
    manager_finance: DataTypes.STRING,
    pic_tax: DataTypes.STRING,
    spv_tax: DataTypes.STRING,
    asman_tax: DataTypes.STRING,
    manager_tax: DataTypes.STRING,
    aos: DataTypes.STRING,
    rom: DataTypes.STRING,
    bm: DataTypes.STRING,
    nom: DataTypes.STRING,
    rbm: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'finance'
  })
  return finance
}
