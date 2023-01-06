'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'nama_ktp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'no_ktp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pajaks', 'nama_ktp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pajaks', 'no_ktp', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'nama_ktp', {})
    await queryInterface.removeColumn('klaims', 'no_ktp', {})
    await queryInterface.removeColumn('pajaks', 'nama_ktp', {})
    await queryInterface.removeColumn('pajaks', 'no_ktp', {})
  }
}
