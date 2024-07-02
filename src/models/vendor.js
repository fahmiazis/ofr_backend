'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  vendor.init({
    nama: DataTypes.STRING,
    no_npwp: DataTypes.STRING,
    no_ktp: DataTypes.STRING,
    alamat: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    datef_skb: DataTypes.DATE,
    datel_skb: DataTypes.DATE,
    no_skb: DataTypes.TEXT,
    no_skt: DataTypes.STRING,
    type_skb: DataTypes.STRING,
    jenis_vendor: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'vendor'
  })
  return vendor
}
