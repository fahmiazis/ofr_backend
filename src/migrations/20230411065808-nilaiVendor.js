'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'nilai_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'nilai_vendor', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'nilai_vendor', {})
    await queryInterface.removeColumn('ikks', 'nilai_vendor', {})
  }
}
