'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class docuser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  docuser.init({
    desc: DataTypes.STRING,
    jenis_dok: DataTypes.STRING,
    divisi: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    path: DataTypes.STRING,
    status: DataTypes.STRING,
    reason: DataTypes.STRING,
    jenis_form: DataTypes.STRING,
    tipe: DataTypes.STRING,
    periode: DataTypes.DATE,
    stat_upload: DataTypes.INTEGER,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'docuser'
  })
  return docuser
}
