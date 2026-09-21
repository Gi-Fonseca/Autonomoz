const FornecedorService = require("../services/FornecedorService");

class FornecedorController {
  // Lista fornecedores
  async listar(req, res) {
    try {
      res.json(await FornecedorService.listar());
    } catch (erro) {
      res.status(500).json({ mensagem: erro.message || erro.mensagem });
    }
  }

  // Busca fornecedor
  async buscarPorId(req, res) {
    try {
      res.json(await FornecedorService.buscarPorId(req.params.id));
    } catch (erro) {
      res.status(500).json({ mensagem: erro.message || erro.mensagem });
    }
  }

  // Cria fornecedor
  async criar(req, res) {
    try {
      res.status(201).json(await FornecedorService.criar(req.body));
    } catch (erro) {
      res
        .status(erro.status || 500)
        .json({ mensagem: erro.message || erro.mensagem });
    }
  }

  // Atualiza fornecedor
  async atualizar(req, res) {
    try {
      res.json(await FornecedorService.atualizar(req.params.id, req.body));
    } catch (erro) {
      res
        .status(erro.status || 500)
        .json({ mensagem: erro.message || erro.mensagem });
    }
  }

  // Exclui fornecedor
  async excluir(req, res) {
    try {
      res.json(await FornecedorService.excluir(req.params.id));
    } catch (erro) {
      res
        .status(erro.status || 500)
        .json({ mensagem: erro.message || erro.mensagem });
    }
  }
}

module.exports = new FornecedorController();
