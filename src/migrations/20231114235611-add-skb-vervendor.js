'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('vervendors', 'no_skt', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('vervendors', 'type_skb', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('vervendors', 'no_skt', {})
    await queryInterface.removeColumn('vervendors', 'type_skb', {})
  }
}
