const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', registroController.criar);

router.get('/', registroController.listar);

router.put('/app', authMiddleware, registroController.editarOuExcluirApp);

module.exports = router;