const AjusteService = require("../services/AjusteService");
const { salvarFotoBase64 } = require("../utils/base64Helper");
const path = require("path");
const fs = require("fs");

class AjusteController {
  // Lista ajustes
  async listar(req, res) {
    try {
      const resultado = await AjusteService.listar();
      return res.status(200).json(resultado);
    } catch (erro) {
      return res
        .status(erro.status || 500)
        .json({ sucesso: false, mensagem: erro.message || erro.mensagem });
    }
  }

  // Busca ajuste por ID
  async buscarPorId(req, res) {
    try {
      const resultado = await AjusteService.buscarPorId(req.params.id);
      return res.status(200).json(resultado);
    } catch (erro) {
      return res
        .status(erro.status || 500)
        .json({ sucesso: false, mensagem: erro.message || erro.mensagem });
    }
  }

  // Cria ajuste (COM FOTO DE COMPROVAÇÃO/AVARIA)
  async criar(req, res) {
    try {
      const dadosAjuste = {
        ...(req.body || {}),
        id_funcionario: req.usuario.id,
        data_ajuste: req.body?.data_ajuste || new Date(),
      };

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Requisição sem corpo. Verifique o payload JSON.",
        });
      }

      if (
        Object.hasOwn(dadosAjuste, "foto") &&
        dadosAjuste.foto !== null &&
        !dadosAjuste.fotoBase64
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Envie a foto como fotoBase64 ou solicite a remoção da foto atual.",
        });
      }

      // Tratamento de foto Base64
      if (dadosAjuste.fotoBase64) {
        const uploadDir = path.join(__dirname, "..", "..", "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        try {
          const nomeArquivo = salvarFotoBase64(
            dadosAjuste.fotoBase64,
            uploadDir,
          );
          dadosAjuste.foto = nomeArquivo;
          delete dadosAjuste.fotoBase64;
        } catch (e) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "fotoBase64 inválida",
            erro: e.message || e,
          });
        }
      }

      const resultado = await AjusteService.criar(dadosAjuste);
      return res.status(201).json(resultado);
    } catch (erro) {
      return res
        .status(erro.status || 500)
        .json({ sucesso: false, mensagem: erro.message || erro.mensagem });
    }
  }

  // Atualiza ajuste (COM FOTO)
  async atualizar(req, res) {
    try {
      const dadosAjuste = req.body || {};

      if (
        Object.hasOwn(dadosAjuste, "foto") &&
        dadosAjuste.foto !== null &&
        !dadosAjuste.fotoBase64
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Envie a nova foto como fotoBase64 ou remova a foto atual.",
        });
      }

      if (dadosAjuste.fotoBase64) {
        const uploadDir = path.join(__dirname, "..", "..", "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        try {
          const nomeArquivo = salvarFotoBase64(
            dadosAjuste.fotoBase64,
            uploadDir,
          );
          dadosAjuste.foto = nomeArquivo;
          delete dadosAjuste.fotoBase64;
        } catch (e) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "fotoBase64 inválida",
            erro: e.message || e,
          });
        }
      }

      const resultado = await AjusteService.atualizar(
        req.params.id,
        dadosAjuste,
      );
      return res.status(200).json(resultado);
    } catch (erro) {
      return res
        .status(erro.status || 500)
        .json({ sucesso: false, mensagem: erro.message || erro.mensagem });
    }
  }
}

module.exports = new AjusteController();
