'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('klirings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama: {
        type: Sequelize.STRING
      },
      nama_singkat: {
        type: Sequelize.STRING
      },
      bic: {
        type: Sequelize.STRING
      },
      sandi_bank: {
        type: Sequelize.STRING
      },
      sandi_usaha: {
        type: Sequelize.STRING
      },
      sandi_kliring: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('klirings')
  }
}
