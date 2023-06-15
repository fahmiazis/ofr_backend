'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'typeniknpwp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'new_ident', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'typeniknpwp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'new_ident', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'typeniknpwp', {})
    await queryInterface.removeColumn('ops', 'new_ident', {})
    await queryInterface.removeColumn('ikks', 'typeniknpwp', {})
    await queryInterface.removeColumn('ikks', 'new_ident', {})
  }
}
