'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('docusers', 'stat_upload', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('docusers', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('docusers', 'stat_upload', {})
    await queryInterface.removeColumn('docusers', 'history', {})
  }
}
