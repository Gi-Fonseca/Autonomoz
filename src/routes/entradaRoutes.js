const express = require("express");
const router = express.Router();
const EntradaController = require("../controllers/EntradaController");

// Rota POST para registrar a entrada
router.post("/", EntradaController.cadastrar);

module.exports = router;