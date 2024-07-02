'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('vervendors', 'jenis_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('vendors', 'jenis_vendor', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('vervendors', 'jenis_vendor', {})
    await queryInterface.removeColumn('vendors', 'jenis_vendor', {})
  }
}
