'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('glikks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_dist: {
        type: Sequelize.STRING
      },
      profit_center: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      system: {
        type: Sequelize.STRING
      },
      gl_account: {
        type: Sequelize.STRING
      },
      gl_name: {
        type: Sequelize.STRING
      },
      history: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('glikks')
  }
}
