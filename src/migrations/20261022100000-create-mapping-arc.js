'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // mapping user AR Center -> area (kode plant) yang diwakili, many to many
    await queryInterface.createTable('mapping_arcs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING
      },
      kode_plant: {
        allowNull: false,
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
    await queryInterface.addIndex('mapping_arcs', ['username', 'kode_plant'], { unique: true })
    await queryInterface.addIndex('mapping_arcs', ['kode_plant'])

    // area yang sedang diwakili user AR Center pada session ini
    await queryInterface.addColumn('user_sessions', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })

    // penanda pembuat ajuan ops (ajuan AR Center dibuat atas nama area)
    await queryInterface.addColumn('ops', 'is_arc', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('ops', 'created_by', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'created_name', {
      type: Sequelize.DataTypes.STRING
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'created_name', {})
    await queryInterface.removeColumn('ops', 'created_by', {})
    await queryInterface.removeColumn('ops', 'is_arc', {})
    await queryInterface.removeColumn('user_sessions', 'kode_plant', {})
    await queryInterface.dropTable('mapping_arcs')
  }
}
