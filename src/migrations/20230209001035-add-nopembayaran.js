'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'no_pembayaran', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'bank_transfer', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'no_pembayaran', {})
    await queryInterface.removeColumn('klaims', 'bank_transfer', {})
  }
}
