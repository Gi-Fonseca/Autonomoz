const EntradaService = require("../services/EntradaService");

class EntradaController {
  async listar(req, res) {
    try {
      return res.json({ sucesso: true, dados: await EntradaService.listar() });
    } catch (erro) {
      console.error("[ENTRADA] Erro ao listar:", erro);
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao carregar entradas" });
    }
  }

  async buscarPorId(req, res) {
    try {
      return res.json({ sucesso: true, dados: await EntradaService.buscarPorId(req.params.id) });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao buscar entrada" });
    }
  }

  async cadastrar(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Informe os dados da entrada." });
      }
      const dados = {
        ...req.body,
        id_funcionario: req.usuario.id,
        data_entrada: req.body.data_entrada || new Date(),
        fornecedor: String(req.body.fornecedor || "Não informado").trim(),
      };
      const resultado = await EntradaService.cadastrar(dados);
      return res.status(201).json({ sucesso: true, mensagem: "Entrada registrada com sucesso", dados: resultado });
    } catch (erro) {
      console.error("[ENTRADA] Erro ao cadastrar:", erro);
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao registrar entrada" });
    }
  }

  async atualizar(req, res) {
    try {
      const dados = { ...(req.body || {}), id_funcionario: req.usuario.id };
      return res.json({ sucesso: true, mensagem: "Entrada atualizada com sucesso", dados: await EntradaService.atualizar(req.params.id, dados) });
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao atualizar entrada" });
    }
  }
}

module.exports = new EntradaController();
