'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'menu_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'menu_proses', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'menu_rev', {})
    await queryInterface.removeColumn('klaims', 'menu_proses', {})
  }
}
