'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'tax_type', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'tax_code', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'tax_type', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'tax_code', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'tax_type', {})
    await queryInterface.removeColumn('ikks', 'tax_code', {})
    await queryInterface.removeColumn('ops', 'tax_type', {})
    await queryInterface.removeColumn('ops', 'tax_code', {})
  }
}
