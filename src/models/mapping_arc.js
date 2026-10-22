'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class mapping_arc extends Model {
    static associate (models) {
      mapping_arc.hasOne(models.user, {
        foreignKey: 'username',
        sourceKey: 'username',
        as: 'user'
      })
      mapping_arc.hasOne(models.finance, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'finance'
      })
    }
  }
  mapping_arc.init({
    username: DataTypes.STRING,
    kode_plant: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'mapping_arc'
  })
  return mapping_arc
}
