'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('emails', 'access', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'status', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'access', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'status', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('emails', 'access', {})
    await queryInterface.removeColumn('emails', 'status', {})
    await queryInterface.removeColumn('approves', 'access', {})
    await queryInterface.removeColumn('approves', 'status', {})
  }
}
