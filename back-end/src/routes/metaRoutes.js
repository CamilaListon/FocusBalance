const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas de metas exigindo login
router.use(authMiddleware);

// Endpoints do CRUD de Metas
router.post('/', metaController.criar);
router.get('/', metaController.listar);
router.put('/:id', metaController.atualizar);
router.delete('/:id', metaController.excluir);

module.exports = router;