'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('veriftaxes', 'tax_type', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('veriftaxes', 'tax_code', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('veriftaxes', 'tax_type', {})
    await queryInterface.removeColumn('veriftaxes', 'tax_code', {})
  }
}
