const MovimentacaoService = require("../services/MovimentacaoService");

class MovimentacaoController {
  async listar(req, res) {
    try {
      const movimentacoes = await MovimentacaoService.listar();
      return res.status(200).json({ sucesso: true, dados: movimentacoes });
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao buscar movimentações",
        erro: erro.stack || erro,
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const movimentacao = await MovimentacaoService.buscarPorId(id);
      return res.status(200).json({ sucesso: true, dados: movimentacao });
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao buscar movimentação",
        erro: erro.stack || erro,
      });
    }
  }

  async cadastrar(req, res) {
    try {
      const dados = req.body || {};

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Requisição sem corpo. Verifique o JSON enviado.",
        });
      }

      const resultado = await MovimentacaoService.cadastrar(dados);

      return res.status(201).json({
        sucesso: true,
        mensagem: "Movimentação registrada com sucesso!",
        dados: resultado,
      });
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao registrar movimentação",
        erro: erro.stack || erro,
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body || {};

      const resultado = await MovimentacaoService.atualizar(id, dados);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Movimentação atualizada com sucesso!",
        dados: resultado,
      });
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao atualizar movimentação",
        erro: erro.stack || erro,
      });
    }
  }

  // Mantido caso precise ser utilizado administrativamente no futuro
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await MovimentacaoService.deletar(id);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Movimentação excluída com sucesso!",
        dados: resultado,
      });
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao excluir movimentação",
        erro: erro.stack || erro,
      });
    }
  }
}

module.exports = new MovimentacaoController();
