'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class glikk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  glikk.init({
    kode_dist: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    area: DataTypes.STRING,
    system: DataTypes.STRING,
    gl_account: DataTypes.STRING,
    gl_name: DataTypes.STRING,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'glikk'
  })
  return glikk
}
