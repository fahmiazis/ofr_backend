'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class tempklaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  tempklaim.init({
    no_transaksi: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    status: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    status_approve: DataTypes.STRING,
    track: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tempklaim'
  })
  return tempklaim
}
