'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class bracket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  bracket.init({
    name: DataTypes.STRING,
    bracket: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    enemi: DataTypes.STRING,
    order: DataTypes.INTEGER,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'bracket'
  })
  return bracket
}
