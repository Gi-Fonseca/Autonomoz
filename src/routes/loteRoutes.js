const express = require('express');
const router = express.Router();
const LoteController = require('../controllers/LoteController'); 


router.get('/', LoteController.listar);
router.post('/', LoteController.criar);
router.get('/:id', LoteController.buscarPorId)

module.exports = router;