const express = require("express");
const router = express.Router();
const funcionarioRoutes = require("./funcionarioRoutes");
const { autenticar } = require("../middlewares/auth");

router.use("/funcionario", funcionarioRoutes);
router.use(autenticar);
router.use("/produto", require("./produtoRoutes"));
router.use("/entrada", require("./entradaRoutes"));
router.use("/saida", require("./saidaRoutes"));
router.use("/movimentacao", require("./movimentacaoRoutes"));
router.use("/categoria", require("./categoriaRoutes"));
router.use("/estoque", require("./estoqueRoutes"));
router.use("/cliente", require("./clienteRoutes"));
router.use("/fornecedor", require("./fornecedorRoutes"));
router.use("/ajuste", require("./ajusteRoutes"));
router.use("/lote", require("./loteRoutes"));

module.exports = router;
