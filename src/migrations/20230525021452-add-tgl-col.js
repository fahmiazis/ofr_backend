'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'tgl_fullarea', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'tgl_veriffin', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'tgl_veriftax', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'tgl_sublist', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'tgl_fullsublist', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_fullarea', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_veriffin', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_verifklm', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_sublist', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_fullsublist', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'tgl_fullarea', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'tgl_veriffin', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'tgl_veriftax', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'tgl_sublist', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'tgl_fullsublist', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'tgl_fullarea', {})
    await queryInterface.removeColumn('ops', 'tgl_veriffin', {})
    await queryInterface.removeColumn('ops', 'tgl_veriftax', {})
    await queryInterface.removeColumn('ops', 'tgl_sublist', {})
    await queryInterface.removeColumn('ops', 'tgl_fullsublist', {})
    await queryInterface.removeColumn('klaims', 'tgl_fullarea', {})
    await queryInterface.removeColumn('klaims', 'tgl_veriffin', {})
    await queryInterface.removeColumn('klaims', 'tgl_verifklm', {})
    await queryInterface.removeColumn('klaims', 'tgl_sublist', {})
    await queryInterface.removeColumn('klaims', 'tgl_fullsublist', {})
    await queryInterface.removeColumn('ikks', 'tgl_fullarea', {})
    await queryInterface.removeColumn('ikks', 'tgl_veriffin', {})
    await queryInterface.removeColumn('ikks', 'tgl_veriftax', {})
    await queryInterface.removeColumn('ikks', 'tgl_sublist', {})
    await queryInterface.removeColumn('ikks', 'tgl_fullsublist', {})
  }
}
