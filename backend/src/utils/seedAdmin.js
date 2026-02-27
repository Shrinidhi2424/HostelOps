require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const existingAdmin = await User.findOne({ where: { email: 'admin@hostelops.com' } });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        await User.create({
            name: 'Admin',
            email: 'admin@hostelops.com',
            password_hash: 'admin123', // Will be hashed by the beforeCreate hook
            role: 'admin',
        });

        console.log('✅ Admin user created successfully.');
        console.log('   Email: admin@hostelops.com');
        console.log('   Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
