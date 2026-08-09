const express = require('express');
const router = express.Router();
const { showSignup, handleSignup, showLogin, handleLogin, handleLogout } = require('../controllers/authController');

router.get('/signup', showSignup);
router.post('/signup', handleSignup);

router.get('/login', showLogin);
router.post('/login', handleLogin);

router.post('/logout', handleLogout);

module.exports = router;
