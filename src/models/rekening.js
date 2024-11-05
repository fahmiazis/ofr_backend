'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class rekening extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      rekening.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
    }
  }
  rekening.init({
    kode_plant: DataTypes.STRING,
    no_rekening: DataTypes.STRING,
    type: DataTypes.STRING,
    bank: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'rekening'
  })
  return rekening
}
