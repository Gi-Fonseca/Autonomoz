const express = require("express");
const router = express.Router();
const SaidaController = require("../controllers/SaidaController");

router.get("/", SaidaController.listar);
router.get("/:id", SaidaController.buscarPorId);
router.post("/", SaidaController.cadastrar);
router.put("/:id", SaidaController.atualizar);

// Bloqueio do DELETE para preservar o histórico
router.delete("/:id", (req, res) => {
  return res.status(405).json({
    sucesso: false,
    mensagem:
      "Operação não permitida: Saídas constituem registros históricos de movimentação. Para correções, realize um lançamento de ajuste via POST.",
  });
});

module.exports = router;
