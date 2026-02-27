const { User } = require('../models');
const { generateToken } = require('../utils/generateToken');

const register = async (req, res, next) => {
    try {
        const { name, email, password, block, room } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        const user = await User.create({
            name,
            email,
            password_hash: password, // Will be hashed via beforeCreate hook
            block: block || null,
            room: room || null,
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
