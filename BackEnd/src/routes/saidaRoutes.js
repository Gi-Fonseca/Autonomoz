const express = require("express");
const router = express.Router();
const SaidaController = require("../controllers/SaidaController");
const { autorizar } = require("../middlewares/auth");

router.get("/", SaidaController.listar);
router.get("/:id", SaidaController.buscarPorId);
router.post("/", SaidaController.cadastrar);
router.put("/:id", (req, res) => {
  return res.status(405).json({
    sucesso: false,
    mensagem: "Edição direta bloqueada. Use o cancelamento/estorno para corrigir o lançamento.",
  });
});
router.post("/:id/cancelar", autorizar("Gerente", "GERENTE"), SaidaController.cancelar);

// Bloqueio do DELETE para preservar o histórico
router.delete("/:id", (req, res) => {
  return res.status(405).json({
    sucesso: false,
    mensagem:
      "Operação não permitida: Saídas constituem registros históricos de movimentação. Para correções, realize um lançamento de ajuste via POST.",
  });
});

module.exports = router;
