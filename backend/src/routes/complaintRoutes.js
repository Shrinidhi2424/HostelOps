const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { createComplaint, getMyComplaints, deleteComplaint } = require('../controllers/complaintController');

router.post('/', authenticateUser, createComplaint);
router.get('/', authenticateUser, getMyComplaints);
router.delete('/:id', authenticateUser, deleteComplaint);

module.exports = router;
