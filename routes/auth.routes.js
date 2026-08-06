const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rute untuk mendaftar akun baru
router.post('/register', authController.register);

// Rute untuk login
router.post('/login', authController.login);

module.exports = router;
