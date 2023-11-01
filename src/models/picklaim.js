'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class picklaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  picklaim.init({
    kode_plant: DataTypes.STRING,
    kode_dist: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    area: DataTypes.STRING,
    area_sap: DataTypes.STRING,
    ksni: DataTypes.STRING,
    nni: DataTypes.STRING,
    nsi: DataTypes.STRING,
    mas: DataTypes.STRING,
    mcp: DataTypes.STRING,
    simba: DataTypes.STRING,
    lotte: DataTypes.STRING,
    mun: DataTypes.STRING,
    eiti: DataTypes.STRING,
    edot: DataTypes.STRING,
    meiji: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'picklaim'
  })
  return picklaim
}
