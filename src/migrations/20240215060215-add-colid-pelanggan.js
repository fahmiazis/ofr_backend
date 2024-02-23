'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'id_pelanggan', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ikks', 'id_pelanggan', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'id_pelanggan', {})
    await queryInterface.removeColumn('ikks', 'id_pelanggan', {})
  }
}
