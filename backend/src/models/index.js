const sequelize = require('../config/database');
const User = require('./User');
const Complaint = require('./Complaint');

// Associations
User.hasMany(Complaint, { foreignKey: 'user_id', as: 'complaints' });
Complaint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    sequelize,
    User,
    Complaint,
};
