'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'no_pol', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ikks', 'nominal_bbm', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ikks', 'liter', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ikks', 'km', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'no_pol', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'nominal_bbm', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'liter', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'km', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'no_pol', {})
    await queryInterface.removeColumn('ikks', 'nominal_bbm', {})
    await queryInterface.removeColumn('ikks', 'liter', {})
    await queryInterface.removeColumn('ikks', 'km', {})
    await queryInterface.removeColumn('ops', 'no_pol', {})
    await queryInterface.removeColumn('ops', 'nominal_bbm', {})
    await queryInterface.removeColumn('ops', 'liter', {})
    await queryInterface.removeColumn('ops', 'km', {})
  }
}
