'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'flag_redpine', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'flag_redpine', {})
  }
}
