'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class depo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  depo.init({
    kode_plant: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    kode_sap_1: DataTypes.STRING,
    kode_sap_2: DataTypes.STRING,
    cost_center: DataTypes.STRING,
    area: DataTypes.STRING,
    channel: DataTypes.STRING,
    distribution: DataTypes.STRING,
    status_area: DataTypes.STRING,
    nom: DataTypes.STRING,
    om: DataTypes.STRING,
    bm: DataTypes.STRING,
    aos: DataTypes.STRING,
    pic_finance: DataTypes.STRING,
    spv_finance: DataTypes.STRING,
    asman_finance: DataTypes.STRING,
    manager_finance: DataTypes.STRING,
    asman: DataTypes.STRING,
    pic_klaim: DataTypes.STRING,
    manager_klaim: DataTypes.STRING,
    pic_tax: DataTypes.STRING,
    manager_tax: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'depo'
  })
  return depo
}
