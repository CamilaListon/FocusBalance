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

// Endpoint: PUT /api/registros/:id
router.put('/:id', registroController.atualizar);

// Endpoint: DELETE /api/registros/:id
router.delete('/:id', registroController.excluir);

module.exports = router;