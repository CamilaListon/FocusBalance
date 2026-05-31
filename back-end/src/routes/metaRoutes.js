const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', metaController.criar);
router.get('/', metaController.listar);
router.put('/:id', metaController.atualizar);
router.delete('/:id', metaController.excluir);

module.exports = router;