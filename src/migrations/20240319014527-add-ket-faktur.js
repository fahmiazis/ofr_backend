'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('fakturkls', 'keterangan', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('outlets', 'keterangan', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('fakturkls', 'keterangan', {})
    await queryInterface.removeColumn('outlets', 'keterangan', {})
  }
}
