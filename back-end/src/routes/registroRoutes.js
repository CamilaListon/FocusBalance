const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplica o middleware de segurança em TODAS as rotas deste arquivo
router.use(authMiddleware);

// Endpoint: POST /api/registros
router.post('/', registroController.criar);

// Endpoint: GET /api/registros
router.get('/', registroController.listar);

// Rota para editar ou excluir um app específico dentro de um dia
router.put('/app', authMiddleware, registroController.editarOuExcluirApp);

module.exports = router;