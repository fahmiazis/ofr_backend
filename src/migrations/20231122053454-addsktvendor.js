'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('vendors', 'no_skt', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('vendors', 'type_skb', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('vendors', 'no_skt', {})
    await queryInterface.removeColumn('vendors', 'type_skb', {})
  }
}
