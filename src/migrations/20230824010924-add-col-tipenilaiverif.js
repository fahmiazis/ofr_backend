'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'type_nilaiverif', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'type_nilaiverif', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'type_nilaiverif', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'tgl_submitbukti', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'tgl_submitbukti', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('klaims', 'tgl_submitbukti', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'type_nilaiverif', {})
    await queryInterface.removeColumn('ops', 'type_nilaiverif', {})
    await queryInterface.removeColumn('klaims', 'type_nilaiverif', {})
    await queryInterface.removeColumn('ikks', 'tgl_submitbukti', {})
    await queryInterface.removeColumn('ops', 'tgl_submitbukti', {})
    await queryInterface.removeColumn('klaims', 'tgl_submitbukti', {})
  }
}
