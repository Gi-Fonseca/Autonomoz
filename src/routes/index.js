console.log("INDEX DE ROTAS CARREGADO");

const express = require("express");
const router = express.Router();

const funcionarioRoutes = require("./FuncionarioRoutes");
const produtoRoutes = require("./ProdutoRoutes");
const entradaRoutes = require("./entradaRoutes");
const saidaRoutes = require("./saidaRoutes"); 
const movimentacaoRoutes = require("./movimentacaoRoutes"); // <-- CORRIGIDO AQUI!

router.use("/funcionario", funcionarioRoutes);
router.use("/produto", produtoRoutes);
router.use("/entrada", entradaRoutes);
router.use("/saida", saidaRoutes);          
router.use("/movimentacao", movimentacaoRoutes);

module.exports = router;