'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class reason extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  reason.init({
    desc: DataTypes.STRING,
    type: DataTypes.STRING,
    route: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'reason'
  })
  return reason
}
