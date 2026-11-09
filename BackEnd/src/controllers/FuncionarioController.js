const FuncionarioService = require("../services/FuncionarioService");
const { salvarFotoBase64 } = require("../utils/base64Helper");

class FuncionarioController {
  async login(req, res) {
    try {
      const { email, senha, cargo } = req.body || {};
      if (!email || !senha) return res.status(400).json({ sucesso: false, mensagem: "E-mail e senha são obrigatórios" });
      if (!cargo) return res.status(400).json({ sucesso: false, mensagem: "Selecione o cargo Gerente ou Estoquista." });
      return res.json(await FuncionarioService.login(email, senha, cargo));
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao realizar login" });
    }
  }

  async resetarSenha(req, res) {
    try {
      const { email, cpf, novaSenha } = req.body || {};
      return res.json(await FuncionarioService.resetarSenha(email, cpf, novaSenha));
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Não foi possível redefinir a senha" });
    }
  }

  async listar(req, res) {
    try { return res.json(await FuncionarioService.listar()); }
    catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || "Erro interno do servidor" }); }
  }

  async buscarPorId(req, res) {
    try { return res.json(await FuncionarioService.buscarPorId(req.params.id)); }
    catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || "Erro interno do servidor" }); }
  }

  async cadastrar(req, res) {
    try {
      const dadosFuncionario = req.body || {};
      if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ sucesso: false, mensagem: "Requisição sem corpo. Verifique Content-Type e o payload JSON." });
      if (!dadosFuncionario.foto && dadosFuncionario.fotoBase64) {
        try { dadosFuncionario.foto = salvarFotoBase64(dadosFuncionario.fotoBase64); delete dadosFuncionario.fotoBase64; }
        catch (erroFoto) { return res.status(400).json({ sucesso: false, mensagem: "fotoBase64 inválida", erro: erroFoto.message || erroFoto }); }
      }
      return res.status(201).json(await FuncionarioService.cadastrar(dadosFuncionario));
    } catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao cadastrar funcionário" }); }
  }

  async atualizar(req, res) {
    try {
      const dadosFuncionario = req.body || {};
      if (!dadosFuncionario.foto && dadosFuncionario.fotoBase64) {
        try { dadosFuncionario.foto = salvarFotoBase64(dadosFuncionario.fotoBase64); delete dadosFuncionario.fotoBase64; }
        catch (erroFoto) { return res.status(400).json({ sucesso: false, mensagem: "fotoBase64 inválida", erro: erroFoto.message || erroFoto }); }
      }
      return res.json(await FuncionarioService.atualizar(req.params.id, dadosFuncionario));
    } catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao atualizar funcionário" }); }
  }

  async deletar(req, res) {
    try { return res.json(await FuncionarioService.deletar(req.params.id)); }
    catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message || "Erro ao deletar funcionário" }); }
  }
}

module.exports = new FuncionarioController();
