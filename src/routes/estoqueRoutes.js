const express = require('express')
const router = express.Router()
const EstoqueController = require('../controllers/EstoqueController.js')

router.get('/', EstoqueController.listarEstoque)
router.get('/:id', EstoqueController.buscarEstoqueId)
router.post('/', EstoqueController.publicarEstoque)
router.put('/:id', EstoqueController.alterarDadosId)
router.delete('/:id', EstoqueController.deletarEstoque)