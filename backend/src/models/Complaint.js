const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    category: {
        type: DataTypes.ENUM('Electrical', 'Plumbing', 'Internet', 'Cleaning', 'Other'),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 2000],
        },
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
        defaultValue: 'Medium',
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved'),
        allowNull: false,
        defaultValue: 'Pending',
    },
}, {
    tableName: 'complaints',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Complaint;
