'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'status_download', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('ops', 'status_download', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('ikks', 'status_download', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'status_download', {})
    await queryInterface.removeColumn('ops', 'status_download', {})
    await queryInterface.removeColumn('ikks', 'status_download', {})
  }
}
