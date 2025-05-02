'use strict';
const { Sequelize, Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserPassword extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserPassword.belongsTo(models.User, {foreignKey: 'ownerUserId'});
      UserPassword.belongsTo(models.User, { foreignKey: 'sharedByUserId', as: 'SharedBy' });
    }
  }
  UserPassword.init({
    ownerUserId: DataTypes.INTEGER, // user who owns the password
    url: DataTypes.STRING, // eg. facebook/login
    username: DataTypes.STRING, // encrypted in the db
    password: DataTypes.STRING, // encrypted in the db
    sharedByUserId: DataTypes.INTEGER, // gives the id of the person who shared the password
    label: DataTypes.STRING,
    weak_encryption: DataTypes.BOOLEAN, // flag to indicate if a password has a weak encryption
    source_password_id: DataTypes.INTEGER // parent password id. 
  }, {
    sequelize,
    modelName: 'UserPassword',
  });
  return UserPassword;
};