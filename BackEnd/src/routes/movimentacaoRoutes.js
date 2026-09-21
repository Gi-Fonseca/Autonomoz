const express = require("express");
const router = express.Router();
const MovimentacaoController = require("../controllers/MovimentacaoController");

router.get("/", MovimentacaoController.listar);
router.get("/:id", MovimentacaoController.buscarPorId);
router.post("/", MovimentacaoController.cadastrar);
router.put("/:id", MovimentacaoController.atualizar);

router.delete("/:id", (req, res) => {
  return res.status(405).json({
    sucesso: false,
    mensagem:
      "Operação não permitida: movimentações constituem registros históricos imutáveis.",
  });
});

module.exports = router;
