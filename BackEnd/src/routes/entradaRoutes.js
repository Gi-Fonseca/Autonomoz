const express = require("express");
const router = express.Router();
const EntradaController = require("../controllers/EntradaController");

router.get("/", EntradaController.listar);
router.get("/:id", EntradaController.buscarPorId);
router.post("/", EntradaController.cadastrar);
router.put("/:id", EntradaController.atualizar);

// Bloqueio do DELETE para preservar o histórico
router.delete("/:id", (req, res) => {
  return res.status(405).json({
    sucesso: false,
    mensagem:
      "Operação não permitida: Entradas constituem registros históricos de movimentação. Para correções, realize um lançamento de ajuste via POST.",
  });
});

module.exports = router;
