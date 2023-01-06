'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'route', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('documents', 'stat_upload', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('documents', 'route', {})
    await queryInterface.removeColumn('documents', 'stat_upload', {})
  }
}
