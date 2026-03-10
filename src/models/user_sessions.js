'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_session extends Model {
    static associate(models) {
      // user_session BELONGS TO users (bukan hasOne)
      // karena user_session yang punya kolom user_id (foreign key)
      user_session.belongsTo(models.user, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  }

  user_session.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    device_info: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'user_session',
  });

  return user_session;
};