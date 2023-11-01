'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('resmails', 'history', {
      type: Sequelize.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('resmails', 'history', {
      type: Sequelize.STRING
    })
  }
}
