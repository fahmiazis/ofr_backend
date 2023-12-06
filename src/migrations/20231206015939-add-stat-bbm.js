'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'stat_bbm', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'stat_bbm', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'stat_bbm', {})
    await queryInterface.removeColumn('ops', 'stat_bbm', {})
  }
}
