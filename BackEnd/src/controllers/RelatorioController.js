const RelatorioService = require("../services/RelatorioService");

async function responder(res, executar) {
  try {
    return res.json(await executar());
  } catch (erro) {
    return res.status(erro.status || 500).json({
      sucesso: false,
      mensagem: erro.mensagem || erro.message || "Erro ao gerar relatório.",
    });
  }
}

class RelatorioController {
  async estoque(req, res) {
    return responder(res, () => RelatorioService.estoque());
  }

  async entradas(req, res) {
    return responder(res, () => RelatorioService.entradas());
  }

  async saidas(req, res) {
    return responder(res, () => RelatorioService.saidas());
  }

  async movimentacoes(req, res) {
    return responder(res, () => RelatorioService.movimentacoes());
  }
}

module.exports = new RelatorioController();
