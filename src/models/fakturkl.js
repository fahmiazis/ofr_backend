'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class fakturkl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  fakturkl.init({
    no_faktur: DataTypes.STRING,
    date_faktur: DataTypes.DATE,
    val: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    status: DataTypes.INTEGER,
    history: DataTypes.TEXT,
    klaimId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'fakturkl'
  })
  return fakturkl
}
