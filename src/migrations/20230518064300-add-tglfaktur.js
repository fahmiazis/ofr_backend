'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'tgl_faktur', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'tgl_faktur', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'tgl_faktur', {})
    await queryInterface.removeColumn('ikks', 'tgl_faktur', {})
  }
}
