const express = require("express");
const router = express.Router();
const ProdutoController = require("../controllers/ProdutoController.js");

// Lista produtos
router.get("/", ProdutoController.listarProduto);
// Busca produto
router.get("/:id", ProdutoController.buscarProdutoId);
// Cria produto
router.post("/", ProdutoController.publicarProduto);
// Atualiza produto
router.put("/:id", ProdutoController.alterarDados);
module.exports = router;
