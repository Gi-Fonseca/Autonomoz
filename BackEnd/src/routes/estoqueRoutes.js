const express = require("express");
const router = express.Router();
const EstoqueController = require("../controllers/EstoqueController");

router.get("/", EstoqueController.listarEstoque);
router.get("/:id", EstoqueController.buscarEstoqueId);
router.post("/", EstoqueController.publicarEstoque);
router.put("/:id", EstoqueController.alterarDadosId); // ou alterarEstoque

// 🚫 Bloqueio explícito com HTTP 405 Method Not Allowed
router.delete("/:id", (req, res) => {
  return res.status(405).json({
    sucesso: false,
    mensagem:
      "Operação não permitida: Registros de estoque constituem histórico. Para correções, realize um lançamento de ajuste via POST.",
  });
});

module.exports = router;
