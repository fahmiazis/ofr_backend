'use strict'

// aman dijalankan ulang: migration ini pernah gagal di tengah (row size ops)
// setelah tabel mapping_arcs dan kolom user_sessions.kode_plant terbuat
const addColumnBila = async (queryInterface, table, column, definisi) => {
  const desc = await queryInterface.describeTable(table)
  if (!desc[column]) {
    await queryInterface.addColumn(table, column, definisi)
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // mapping user AR Central -> area (kode plant) yang diwakili, many to many
    const listTable = (await queryInterface.showAllTables()).map(x => `${x}`.toLowerCase())
    if (!listTable.includes('mapping_arcs')) {
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
    }

    // area yang sedang diwakili user AR Central pada session ini
    await addColumnBila(queryInterface, 'user_sessions', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })

    // penanda pembuat ajuan ops (ajuan AR Central dibuat atas nama area)
    await addColumnBila(queryInterface, 'ops', 'is_arc', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    })
    await addColumnBila(queryInterface, 'ops', 'created_by', {
      type: Sequelize.DataTypes.STRING(100)
    })
    await addColumnBila(queryInterface, 'ops', 'created_name', {
      type: Sequelize.DataTypes.STRING(100)
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
