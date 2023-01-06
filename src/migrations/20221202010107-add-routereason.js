'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('reasons', 'route', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('reasons', 'route', {})
  }
}
