'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('fakturkls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_faktur: {
        type: Sequelize.STRING
      },
      date_faktur: {
        type: Sequelize.DATE
      },
      val: {
        type: Sequelize.STRING
      },
      no_transaksi: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      history: {
        type: Sequelize.TEXT
      },
      klaimId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('fakturkls')
  }
}
