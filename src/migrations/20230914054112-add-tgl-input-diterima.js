'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'tgl_getdana', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'tgl_getdana', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_getdana', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'tgl_getdana', {})
    await queryInterface.removeColumn('ops', 'tgl_getdana', {})
    await queryInterface.removeColumn('klaims', 'tgl_getdana', {})
  }
}
