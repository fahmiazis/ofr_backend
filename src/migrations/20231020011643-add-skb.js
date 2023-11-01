'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'stat_skb', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ikks', 'stat_skt', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'stat_skb', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'stat_skt', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'stat_skb', {})
    await queryInterface.removeColumn('ikks', 'stat_skt', {})
    await queryInterface.removeColumn('ops', 'stat_skb', {})
    await queryInterface.removeColumn('ops', 'stat_skt', {})
  }
}
