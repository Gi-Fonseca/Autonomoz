const MovimentacaoService = require("../services/MovimentacaoService");

function erroHttp(erro, res) {
  return res.status(erro.status || 500).json({
    sucesso: false,
    mensagem: erro.mensagem || erro.message || "Erro ao processar a movimentação.",
  });
}

class MovimentacaoController {
  async listar(req, res) {
    try {
      const resultado = await MovimentacaoService.listar();
      return res.status(200).json(resultado);
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await MovimentacaoService.buscarPorId(req.params.id);
      return res.status(200).json(resultado);
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }

  async cadastrar(req, res) {
    try {
      const resultado = await MovimentacaoService.cadastrar(req.body || {});
      return res.status(201).json(resultado);
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }

  async atualizar(req, res) {
    try {
      const resultado = await MovimentacaoService.atualizar(
        req.params.id,
        req.body || {},
      );
      return res.status(200).json(resultado);
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }
}

module.exports = new MovimentacaoController();
