const express = require("express");
const router = express.Router();
const RelatorioController = require("../controllers/RelatorioController");

router.get("/estoque", RelatorioController.estoque);
router.get("/movimentacoes", RelatorioController.movimentacoes);
router.get("/entradas", RelatorioController.entradas);
router.get("/saidas", RelatorioController.saidas);

module.exports = router;
