const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { createComplaint, getMyComplaints } = require('../controllers/complaintController');

router.post('/', authenticateUser, createComplaint);
router.get('/', authenticateUser, getMyComplaints);

module.exports = router;
