const { Complaint } = require('../models');

const createComplaint = async (req, res, next) => {
    try {
        const { category, description, priority } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'Category and description are required.' });
        }

        const validCategories = ['Electrical', 'Plumbing', 'Internet', 'Cleaning', 'Other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        }

        const validPriorities = ['Low', 'Medium', 'High'];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
        }

        const complaint = await Complaint.create({
            user_id: req.user.id,
            category,
            description,
            priority: priority || 'Medium',
        });

        res.status(201).json({
            message: 'Complaint submitted successfully.',
            complaint,
        });
    } catch (error) {
        next(error);
    }
};

const getMyComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({ complaints });
    } catch (error) {
        next(error);
    }
};

const deleteComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        // Only the owner can delete their own complaint
        if (complaint.user_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own complaints.' });
        }

        // Only allow deletion if status is Pending
        if (complaint.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending complaints can be deleted.' });
        }

        await complaint.destroy();

        res.status(200).json({ message: 'Complaint deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createComplaint, getMyComplaints, deleteComplaint };

