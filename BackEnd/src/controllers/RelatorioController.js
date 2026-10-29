const RelatorioService = require("../services/RelatorioService");

class RelatorioController {
  async estoque(req, res) {
    try {
      return res.json(await RelatorioService.estoque());
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao gerar relatório de estoque",
      });
    }
  }
}

module.exports = new RelatorioController();
