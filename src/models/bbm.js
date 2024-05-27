'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class bbm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  bbm.init({
    no_pol: DataTypes.STRING,
    nominal: DataTypes.STRING,
    liter: DataTypes.STRING,
    km: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    status: DataTypes.INTEGER,
    history: DataTypes.TEXT,
    transId: DataTypes.STRING,
    date_bbm: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'bbm'
  })
  return bbm
}
