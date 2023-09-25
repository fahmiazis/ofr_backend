'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('veriftaxes', 'grouping', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pagus', 'saldo', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pagus', 'tgl_saldo', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('veriftaxes', 'grouping', {})
    await queryInterface.removeColumn('pagus', 'saldo', {})
    await queryInterface.removeColumn('pagus', 'tgl_saldo', {})
  }
}
