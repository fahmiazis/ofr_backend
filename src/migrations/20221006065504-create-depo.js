'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('depos', {
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
      kode_sap_1: {
        type: Sequelize.STRING
      },
      kode_sap_2: {
        type: Sequelize.STRING
      },
      cost_center: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      distribution: {
        type: Sequelize.STRING
      },
      status_area: {
        type: Sequelize.STRING
      },
      nom: {
        type: Sequelize.STRING
      },
      om: {
        type: Sequelize.STRING
      },
      bm: {
        type: Sequelize.STRING
      },
      aos: {
        type: Sequelize.STRING
      },
      pic_1: {
        type: Sequelize.STRING
      },
      pic_2: {
        type: Sequelize.STRING
      },
      pic_3: {
        type: Sequelize.STRING
      },
      pic_4: {
        type: Sequelize.STRING
      },
      asman: {
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
    await queryInterface.dropTable('depos')
  }
}
