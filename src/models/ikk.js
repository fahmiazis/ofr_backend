'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ikk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  ikk.init({
    kode_plant: DataTypes.STRING,
    status_transaksi: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'ikk'
  })
  return ikk
}
