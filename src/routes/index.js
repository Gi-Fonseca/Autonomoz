console.log("INDEX DE ROTAS CARREGADO");

const express = require("express");
const router = express.Router();

const funcionarioRoutes = require("./funcionarioRoutes");
const produtoRoutes = require("./produtoRoutes");
const entradaRoutes = require("./entradaRoutes");
const saidaRoutes = require("./saidaRoutes"); 
const movimentacaoRoutes = require("./movimentacaoRoutes");
const categoriaRoutes = require("./categoriaRoutes"); 
const estoqueRoutes = require("./estoqueRoutes"); 
const clienteRoutes = require("./clienteRoutes");
const fornecedorRoutes = require("./fornecedorRoutes");
const ajusteRoutes = require("./ajusteRoutes");
const loteRoutes = require("./loteRoutes");


router.use("/funcionario", funcionarioRoutes);
router.use("/produto", produtoRoutes);
router.use("/entrada", entradaRoutes);
router.use("/saida", saidaRoutes);          
router.use("/movimentacao", movimentacaoRoutes);
router.use("/categoria", categoriaRoutes);
router.use("/estoque", estoqueRoutes);
router.use("/cliente", clienteRoutes);
router.use("/fornecedor", fornecedorRoutes);
router.use("/ajuste", ajusteRoutes);
router.use("/lote", loteRoutes);


module.exports = router;
