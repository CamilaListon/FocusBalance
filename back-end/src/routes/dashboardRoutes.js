// back-end/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege a rota: só passa quem tem o Token JWT válido
router.use(authMiddleware);

// Endpoint: GET /api/dashboard
router.get('/', dashboardController.obterResumo);

module.exports = router;