const express = require('express')
const router = express.Router()
const CategoriaController = require('../controllers/CategoriaController.js')

router.get('/', CategoriaController.listarCategoria)
router.get('/:id', CategoriaController.buscarCategoriaId)
router.post('/', CategoriaController.publicarCategoria)
router.put('/:id', CategoriaController.alterarDadosId)
router.delete('/:id', CategoriaController.deletarCategoria)

module.exports = router;