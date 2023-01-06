'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('coas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_coa: {
        type: Sequelize.STRING
      },
      nama_coa: {
        type: Sequelize.STRING
      },
      sub_coa: {
        type: Sequelize.STRING
      },
      nama_subcoa: {
        type: Sequelize.STRING
      },
      tipe: {
        type: Sequelize.STRING
      },
      flagdata: {
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
    await queryInterface.dropTable('coas')
  }
}
