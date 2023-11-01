'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'datef_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'datel_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'no_skb', {
      type: Sequelize.DataTypes.TEXT
    })

    await queryInterface.addColumn('ops', 'datef_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'datel_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'no_skb', {
      type: Sequelize.DataTypes.TEXT
    })

    await queryInterface.addColumn('vervendors', 'datef_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('vervendors', 'datel_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('vervendors', 'no_skb', {
      type: Sequelize.DataTypes.TEXT
    })

    await queryInterface.addColumn('vendors', 'datef_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('vendors', 'datel_skb', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('vendors', 'no_skb', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'datef_skb', {})
    await queryInterface.removeColumn('ikks', 'datel_skb', {})
    await queryInterface.removeColumn('ikks', 'no_skb', {})

    await queryInterface.removeColumn('ops', 'datef_skb', {})
    await queryInterface.removeColumn('ops', 'datel_skb', {})
    await queryInterface.removeColumn('ops', 'no_skb', {})

    await queryInterface.removeColumn('vervendors', 'datef_skb', {})
    await queryInterface.removeColumn('vervendors', 'datel_skb', {})
    await queryInterface.removeColumn('vervendors', 'no_skb', {})

    await queryInterface.removeColumn('vendors', 'datef_skb', {})
    await queryInterface.removeColumn('vendors', 'datel_skb', {})
    await queryInterface.removeColumn('vendors', 'no_skb', {})
  }
}
