const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, perfilController.obterPerfil);
router.put('/', authMiddleware, perfilController.atualizarPerfil);
router.delete('/', authMiddleware, perfilController.deletarConta);

module.exports = router;