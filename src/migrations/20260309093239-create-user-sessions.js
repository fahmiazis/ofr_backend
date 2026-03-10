'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false 
      },
      refresh_token: { 
        type: Sequelize.TEXT,
        allowNull: false 
      },
      device_info: { 
        type: Sequelize.STRING
      },
      ip_address: { 
        type: Sequelize.STRING
      },
      is_active: { 
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      expires_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_sessions');
  }
};