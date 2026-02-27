const { Complaint, User } = require('../models');
const { Op } = require('sequelize');

const getAllComplaints = async (req, res, next) => {
    try {
        const { category, status, priority } = req.query;

        const where = {};
        if (category) where.category = category;
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const complaints = await Complaint.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'block', 'room'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({ complaints });
    } catch (error) {
        next(error);
    }
};

const updateComplaintStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        complaint.status = status;
        await complaint.save();

        res.status(200).json({
            message: 'Complaint status updated successfully.',
            complaint,
        });
    } catch (error) {
        next(error);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const total = await Complaint.count();
        const pending = await Complaint.count({ where: { status: 'Pending' } });
        const inProgress = await Complaint.count({ where: { status: 'In Progress' } });
        const resolved = await Complaint.count({ where: { status: 'Resolved' } });

        res.status(200).json({
            stats: { total, pending, inProgress, resolved },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllComplaints, updateComplaintStatus, getDashboardStats };
