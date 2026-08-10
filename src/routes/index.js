console.log("INDEX DE ROTAS CARREGADO");

const express = require("express");
const router = express.Router();

const funcionarioRoutes = require("./FuncionarioRoutes");
const produtoRoutes = require("./ProdutoRoutes");
const entradaRoutes = require("./entradaRoutes");
const saidaRoutes = require("./saidaRoutes"); 

router.use("/funcionario", funcionarioRoutes);
router.use("/produto", produtoRoutes);
router.use("/entrada", entradaRoutes);
router.use("/saida", saidaRoutes);          

module.exports = router;