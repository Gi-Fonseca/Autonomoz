const MovimentacaoService = require("../services/MovimentacaoService");

class MovimentacaoController {
  async listar(req, res) {
    try {
      return res.json(await MovimentacaoService.listar());
    } catch (erro) {
      console.error("[MOVIMENTACAO] Erro ao listar:", erro);
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao carregar movimentações",
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      return res.json(await MovimentacaoService.buscarPorId(req.params.id));
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao buscar movimentação" });
    }
  }

  async cadastrar(req, res) {
    try {
      return res.status(201).json({
        ...(await MovimentacaoService.cadastrar(req.body || {})),
        mensagem: "Movimentação registrada com sucesso",
      });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao registrar movimentação" });
    }
  }

  async atualizar(req, res) {
    try {
      return res.json({
        ...(await MovimentacaoService.atualizar(req.params.id, req.body || {})),
        mensagem: "Movimentação atualizada com sucesso",
      });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao atualizar movimentação" });
    }
  }

  async deletar(req, res) {
    try {
      return res.json({
        ...(await MovimentacaoService.deletar(req.params.id)),
        mensagem: "Movimentação excluída com sucesso",
      });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao excluir movimentação" });
    }
  }
}

module.exports = new MovimentacaoController();
