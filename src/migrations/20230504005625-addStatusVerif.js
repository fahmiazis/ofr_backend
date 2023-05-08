'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('vendors', 'alamat', {
      type: Sequelize.TEXT
    })
    await queryInterface.addColumn('veriftaxes', 'status_ident', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('coas', 'status_ident', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('vendors', 'alamat', {
      type: Sequelize.STRING
    })
    await queryInterface.removeColumn('veriftaxes', 'status_ident', {})
    await queryInterface.removeColumn('coas', 'status_ident', {})
  }
}
