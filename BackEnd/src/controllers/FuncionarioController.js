const FuncionarioService = require("../services/FuncionarioService");
const { salvarFotoBase64 } = require("../utils/base64Helper");

const path = require("path");
const fs = require("fs");

class FuncionarioController {
  async login(req, res) {
    try {
      const { email, senha } = req.body || {};
      if (!email || !senha)
        return res
          .status(400)
          .json({
            sucesso: false,
            mensagem: "E-mail e senha são obrigatórios",
          });
      return res.json(await FuncionarioService.login(email, senha));
    } catch (erro) {
      return res
        .status(erro.status || 500)
        .json({
          sucesso: false,
          mensagem: erro.mensagem || "Erro ao realizar login",
        });
    }
  }

  // Método para listar todos os funcionários
  async listar(req, res) {
    try {
      const resultado = await FuncionarioService.listar();
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno do servidor",
        erro: erro.stack || erro,
      });
    }
  }

  // Método para buscar um funcionário por ID
  async buscarPorId(req, res) {
    try {
      const resultado = await FuncionarioService.buscarPorId(req.params.id);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno do servidor",
      });
    }
  }

  // Método para cadastrar um novo funcionário (COM FOTO)
  async cadastrar(req, res) {
    try {
      const dadosFuncionario = req.body || {};

      // Verifica se o corpo da requisição foi enviado
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Requisição sem corpo. Verifique Content-Type e o payload JSON.",
        });
      }

      // Upload da foto em Base64
      if (!dadosFuncionario.foto && dadosFuncionario.fotoBase64) {
        const uploadDir = path.join(__dirname, "..", "..", "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, {
            recursive: true,
          });
        }

        let nomeArquivo;

        try {
          nomeArquivo = salvarFotoBase64(
            dadosFuncionario.fotoBase64,
            uploadDir,
          );
        } catch (e) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "fotoBase64 inválida",
            erro: e.message || e,
          });
        }

        // Salva apenas o nome da imagem
        dadosFuncionario.foto = nomeArquivo;

        // Remove o Base64 antes de enviar ao banco
        delete dadosFuncionario.fotoBase64;
      }

      const resultado = await FuncionarioService.cadastrar(dadosFuncionario);

      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao cadastrar funcionário",
        erro: erro.stack || erro,
      });
    }
  }

  // Método para atualizar um funcionário (COM FOTO)
  async atualizar(req, res) {
    try {
      const dadosFuncionario = req.body || {};

      if (!dadosFuncionario.foto && dadosFuncionario.fotoBase64) {
        const uploadDir = path.join(__dirname, "..", "..", "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, {
            recursive: true,
          });
        }

        let nomeArquivo;

        try {
          nomeArquivo = salvarFotoBase64(
            dadosFuncionario.fotoBase64,
            uploadDir,
          );
        } catch (e) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "fotoBase64 inválida",
            erro: e.message || e,
          });
        }

        dadosFuncionario.foto = nomeArquivo;
        delete dadosFuncionario.fotoBase64;
      }

      const resultado = await FuncionarioService.atualizar(
        req.params.id,
        dadosFuncionario,
      );

      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao atualizar funcionário",
        erro: erro.stack || erro,
      });
    }
  }

  // Método para deletar um funcionário
  async deletar(req, res) {
    try {
      const resultado = await FuncionarioService.deletar(req.params.id);
      res.json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao deletar funcionário",
      });
    }
  }
}

module.exports = new FuncionarioController();
