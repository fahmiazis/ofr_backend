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
    pic_1: DataTypes.STRING,
    pic_2: DataTypes.STRING,
    pic_3: DataTypes.STRING,
    pic_4: DataTypes.STRING,
    asman: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'depo'
  })
  return depo
}
