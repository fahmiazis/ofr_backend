'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'nilai_verif', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'nilai_verif', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'nilai_verif', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'nilai_verif', {})
    await queryInterface.removeColumn('ops', 'nilai_verif', {})
    await queryInterface.removeColumn('klaims', 'nilai_verif', {})
  }
}
