const express = require("express");
const router = express.Router();
const AjusteController = require("../controllers/AjusteController");

router.get("/", AjusteController.listar);
router.get("/:id", AjusteController.buscarPorId);
router.post("/", AjusteController.criar);
router.put("/:id", AjusteController.atualizar);

module.exports = router;
