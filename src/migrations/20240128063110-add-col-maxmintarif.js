'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('veriftaxes', 'min_nominal', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('veriftaxes', 'max_nominal', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('veriftaxes', 'start_period', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('veriftaxes', 'end_period', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('veriftaxes', 'min_nominal', {})
    await queryInterface.removeColumn('veriftaxes', 'max_nominal', {})
    await queryInterface.removeColumn('veriftaxes', 'start_period', {})
    await queryInterface.removeColumn('veriftaxes', 'end_period', {})
  }
}
