'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class nameapp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  nameapp.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nameapp'
  })
  return nameapp
}
