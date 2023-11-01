'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('picklaims', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
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
      area_sap: {
        type: Sequelize.STRING
      },
      ksni: {
        type: Sequelize.STRING
      },
      nni: {
        type: Sequelize.STRING
      },
      nsi: {
        type: Sequelize.STRING
      },
      mas: {
        type: Sequelize.STRING
      },
      mcp: {
        type: Sequelize.STRING
      },
      simba: {
        type: Sequelize.STRING
      },
      lotte: {
        type: Sequelize.STRING
      },
      mun: {
        type: Sequelize.STRING
      },
      eiti: {
        type: Sequelize.STRING
      },
      edot: {
        type: Sequelize.STRING
      },
      meiji: {
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
    await queryInterface.dropTable('picklaims')
  }
}
