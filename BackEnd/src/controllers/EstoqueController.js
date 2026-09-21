const EstoqueService = require("../services/EstoqueService.js");

class EstoqueController {
  async listarEstoque(req, res) {
    try {
      const resultado = await EstoqueService.listarEstoque();
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno do servidor",
        erro: erro.stack || erro,
      });
    }
  }

  async buscarEstoqueId(req, res) {
    try {
      const resultado = await EstoqueService.buscarEstoqueId(req.params.id);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }

  async publicarEstoque(req, res) {
    try {
      const resultado = await EstoqueService.publicarEstoque(req.body);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }

  async alterarDadosId(req, res) {
    try {
      const resultado = await EstoqueService.alterarDadosId(
        req.params.id,
        req.body,
      );
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }

  async deletarEstoque(req, res) {
    try {
      const resultado = await EstoqueService.deletarEstoque(req.params.id);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }
}

module.exports = new EstoqueController();
