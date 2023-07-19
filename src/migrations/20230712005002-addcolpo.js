'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'nilai_po', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'nilai_pr', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'nilai_po', {})
    await queryInterface.removeColumn('ops', 'nilai_pr', {})
  }
}
