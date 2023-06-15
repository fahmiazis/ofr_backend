'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('finances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      profit_center: {
        type: Sequelize.STRING
      },
      region: {
        type: Sequelize.STRING
      },
      inisial: {
        type: Sequelize.STRING
      },
      pic_console: {
        type: Sequelize.STRING
      },
      rek_spending: {
        type: Sequelize.STRING
      },
      rek_zba: {
        type: Sequelize.STRING
      },
      rek_bankcoll: {
        type: Sequelize.STRING
      },
      rekening: {
        type: Sequelize.STRING
      },
      type_live: {
        type: Sequelize.STRING
      },
      gl_kk: {
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
    await queryInterface.dropTable('finances')
  }
}
