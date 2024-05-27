'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('bbms', 'date_bbm', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bbms', 'date_bbm', {})
  }
}
