const express = require("express");
const router = express.Router();
const RelatorioController = require("../controllers/RelatorioController");

router.get("/estoque", RelatorioController.estoque);

module.exports = router;
