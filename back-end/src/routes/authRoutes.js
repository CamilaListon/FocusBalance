const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota POST para Cadastro: /api/auth/cadastro
router.post('/cadastro', authController.cadastro);

// Rota POST para Login: /api/auth/login
router.post('/login', authController.login);

module.exports = router;