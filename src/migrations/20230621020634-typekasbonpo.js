'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'type_kasbon', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('documents', 'type_po', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'type_po', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'no_po', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('documents', 'type_kasbon', {})
    await queryInterface.removeColumn('documents', 'type_po', {})
    await queryInterface.removeColumn('ops', 'type_po', {})
    await queryInterface.removeColumn('ops', 'no_po', {})
  }
}
