'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('namedocs', 'menu', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('namedocs', 'status', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('documents', 'status', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('namedocs', 'menu', {})
    await queryInterface.removeColumn('namedocs', 'status', {})
    await queryInterface.removeColumn('documents', 'status', {})
  }
}
