'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class faktur extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  faktur.init({
    no_faktur: DataTypes.STRING,
    tgl_faktur: DataTypes.DATE,
    npwp: DataTypes.STRING,
    nama: DataTypes.STRING,
    jumlah_dpp: DataTypes.STRING,
    jumlah_ppn: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'faktur'
  })
  return faktur
}
