const FornecedorService = require("../services/FornecedorService");

class FornecedorController {
  async listar(req, res) {
    try {
      return res.json({ sucesso: true, dados: await FornecedorService.listar() });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.sqlMessage || erro.message || erro.mensagem || "Erro ao listar fornecedores" });
    }
  }

  async buscarPorId(req, res) {
    try {
      return res.json({ sucesso: true, dados: await FornecedorService.buscarPorId(req.params.id) });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.sqlMessage || erro.message || erro.mensagem || "Erro ao buscar fornecedor" });
    }
  }

  async criar(req, res) {
    try {
      const dados = await FornecedorService.criar(req.body || {});
      return res.status(201).json({ sucesso: true, mensagem: "Fornecedor cadastrado com sucesso", dados });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.sqlMessage || erro.message || erro.mensagem || "Erro ao cadastrar fornecedor" });
    }
  }

  async atualizar(req, res) {
    try {
      return res.json({ sucesso: true, dados: await FornecedorService.atualizar(req.params.id, req.body || {}) });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.sqlMessage || erro.message || erro.mensagem || "Erro ao atualizar fornecedor" });
    }
  }

  async excluir(req, res) {
    try {
      return res.json({ sucesso: true, dados: await FornecedorService.excluir(req.params.id) });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.sqlMessage || erro.message || erro.mensagem || "Erro ao excluir fornecedor" });
    }
  }
}

module.exports = new FornecedorController();
