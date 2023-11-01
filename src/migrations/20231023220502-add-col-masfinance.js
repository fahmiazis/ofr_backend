'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('finances', 'area', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'pagu', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'pic_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'spv_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'spv2_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'asman_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'manager_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'pic_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'spv_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'asman_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'manager_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'aos', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'rom', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'bm', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'nom', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('finances', 'rbm', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('finances', 'area', {})
    await queryInterface.removeColumn('finances', 'pagu', {})
    await queryInterface.removeColumn('finances', 'pic_finance', {})
    await queryInterface.removeColumn('finances', 'spv_finance', {})
    await queryInterface.removeColumn('finances', 'spv2_finance', {})
    await queryInterface.removeColumn('finances', 'asman_finance', {})
    await queryInterface.removeColumn('finances', 'manager_finance', {})
    await queryInterface.removeColumn('finances', 'pic_tax', {})
    await queryInterface.removeColumn('finances', 'spv_tax', {})
    await queryInterface.removeColumn('finances', 'asman_tax', {})
    await queryInterface.removeColumn('finances', 'manager_tax', {})
    await queryInterface.removeColumn('finances', 'aos', {})
    await queryInterface.removeColumn('finances', 'rom', {})
    await queryInterface.removeColumn('finances', 'bm', {})
    await queryInterface.removeColumn('finances', 'nom', {})
    await queryInterface.removeColumn('finances', 'rbm', {})
  }
}
