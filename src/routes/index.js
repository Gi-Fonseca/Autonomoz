console.log("INDEX DE ROTAS CARREGADO");

const express = require("express");
const router = express.Router();

const funcionarioRoutes = require("./FuncionarioRoutes");
const produtoRoutes = require("./ProdutoRoutes");

console.log("FUNCIONARIO ROUTES CARREGADO");
console.log("PRODUTO ROUTES CARREGADO");

router.use("/funcionario", funcionarioRoutes);
router.use("/produto", produtoRoutes);

module.exports = router;