const express = require('express');
const router = express.Router();
const { showAdmin, deletePaste, deleteUser } = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

router.get('/admin', isAdmin, showAdmin);
router.post('/admin/delete-paste/:id', isAdmin, deletePaste);
router.post('/admin/delete-user/:id', isAdmin, deleteUser);

module.exports = router;
