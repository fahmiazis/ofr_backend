'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('coas', 'kode_principal', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('coas', 'nama_principal', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('coas', 'kode_principal', {})
    await queryInterface.removeColumn('coas', 'nama_principal', {})
  }
}
