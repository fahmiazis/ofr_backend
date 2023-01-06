'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'start_klaim', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'end_klaim', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'end_proses', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'start_klaim', {})
    await queryInterface.removeColumn('klaims', 'end_klaim', {})
    await queryInterface.removeColumn('klaims', 'end_proses', {})
    await queryInterface.removeColumn('klaims', 'history', {})
  }
}
