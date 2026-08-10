const express = require('express')
const router = express.Router()
const ProdutoController = require('../controllers/produtoController.js')

router.get('/', ProdutoController.listarProduto)
router.get('/:id', ProdutoController.buscarProdutoId)
router.post('/', ProdutoController.publicarProduto)
router.put('/:id', ProdutoController.alterarDados)
router.delete('/:id', ProdutoController.deletarProduto)

module.exports = router