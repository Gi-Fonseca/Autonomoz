const ProdutoService = require("../services/ProdutoService.js");
const { salvarFotoBase64 } = require("../utils/base64Helper");

class ProdutoController {
  // Lista produtos
  async listarProduto(req, res) {
    try {
      const resultado = await ProdutoService.listarProdutos(req.query);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || erro.sqlMessage || erro.message || "Erro interno do servidor",
        erro: erro.stack || erro,
      });
    }
  }

  // Busca produto
  async buscarProdutoId(req, res) {
    try {
      const resultado = await ProdutoService.buscarProdutoId(req.params.id);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || erro.sqlMessage || erro.message || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }

  // Cria produto
  async publicarProduto(req, res) {
    try {
      const dados = { ...(req.body || {}) };
      if (dados.fotoBase64) {
        dados.foto = salvarFotoBase64(dados.fotoBase64);
        delete dados.fotoBase64;
      }
      const resultado = await ProdutoService.publicarProduto(dados);
      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || erro.sqlMessage || erro.message || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }

  // Atualiza produto
  async alterarDados(req, res) {
    try {
      const dados = { ...(req.body || {}) };
      if (dados.fotoBase64) {
        dados.foto = salvarFotoBase64(dados.fotoBase64);
        delete dados.fotoBase64;
      }
      const resultado = await ProdutoService.alterarDados(req.params.id, dados);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || erro.sqlMessage || erro.message || "Erro interno no servidor",
        erro: erro.stack || erro,
      });
    }
  }

  async listarAlertas(req, res) {
    try {
      return res.json(await ProdutoService.alertas());
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || erro.sqlMessage || erro.message || "Erro ao buscar alertas",
      });
    }
  }
}

module.exports = new ProdutoController();
