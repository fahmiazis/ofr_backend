'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class scylla extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  scylla.init({
    kd_reg: DataTypes.STRING,
    region: DataTypes.STRING,
    kd_sap2: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    kode_depo: DataTypes.STRING,
    initial_depo: DataTypes.STRING,
    nm_depo: DataTypes.STRING,
    area: DataTypes.STRING,
    channel: DataTypes.STRING,
    status: DataTypes.STRING,
    system: DataTypes.STRING,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'scylla'
  })
  return scylla
}
