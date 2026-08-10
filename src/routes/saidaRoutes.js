const express = require("express");
const router = express.Router();
const SaidaController = require("../controllers/SaidaController");

// Rota POST para registrar a saída do produto
router.post("/", SaidaController.cadastrar);

module.exports = router;