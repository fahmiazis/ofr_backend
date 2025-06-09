'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('rekvendors', 'no_transaksi', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('rekvendors', 'status', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('rekvendors', 'no_transaksi', {})
    await queryInterface.removeColumn('rekvendors', 'status', {})
  }
}
