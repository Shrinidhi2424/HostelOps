const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { getAllComplaints, updateComplaintStatus, getDashboardStats } = require('../controllers/adminController');

router.get('/complaints', authenticateUser, authorizeAdmin, getAllComplaints);
router.patch('/complaints/:id', authenticateUser, authorizeAdmin, updateComplaintStatus);
router.get('/stats', authenticateUser, authorizeAdmin, getDashboardStats);

module.exports = router;
