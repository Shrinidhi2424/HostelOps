const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100],
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('student', 'admin'),
        defaultValue: 'student',
        allowNull: false,
    },
    block: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    room: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: false,
});

// Hash password before creating user
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
});

// Instance method to compare passwords
User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

// Remove password from JSON output
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
};

module.exports = User;
