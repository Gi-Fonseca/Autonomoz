const AjusteService = require('../services/AjusteService');
const { salvarFotoBase64 } = require("../utils/base64Helper");
const path = require("path");
const fs = require("fs");

class AjusteController {
    // Lista ajustes
    async listar(req, res) {
        try { 
            const resultado = await AjusteService.listar();
            return res.status(200).json({ sucesso: true, dados: resultado });
        } catch (erro) { 
            return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.message || erro.mensagem });
        }
    }

    // Busca ajuste por ID
    async buscarPorId(req, res) {
        try { 
            const resultado = await AjusteService.buscarPorId(req.params.id);
            return res.status(200).json({ sucesso: true, dados: resultado });
        } catch (erro) { 
            return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.message || erro.mensagem });
        }
    }

    // Cria ajuste (COM FOTO DE COMPROVAÇÃO/AVARIA)
    async criar(req, res) {
        try {
            const dadosAjuste = req.body || {};

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Requisição sem corpo. Verifique o payload JSON."
                });
            }

            // Tratamento de foto Base64
            if (!dadosAjuste.foto && dadosAjuste.fotoBase64) {
                const uploadDir = path.join(__dirname, "..", "..", "uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                try {
                    const nomeArquivo = salvarFotoBase64(dadosAjuste.fotoBase64, uploadDir);
                    dadosAjuste.foto = nomeArquivo;
                    delete dadosAjuste.fotoBase64;
                } catch (e) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: "fotoBase64 inválida",
                        erro: e.message || e
                    });
                }
            }

            const resultado = await AjusteService.criar(dadosAjuste);
            return res.status(201).json({
                sucesso: true,
                mensagem: "Ajuste registrado com sucesso!",
                dados: resultado
            });
        } catch (erro) { 
            return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.message || erro.mensagem });
        }
    }

    // Atualiza ajuste (COM FOTO)
    async atualizar(req, res) {
        try {
            const dadosAjuste = req.body || {};

            if (!dadosAjuste.foto && dadosAjuste.fotoBase64) {
                const uploadDir = path.join(__dirname, "..", "..", "uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                try {
                    const nomeArquivo = salvarFotoBase64(dadosAjuste.fotoBase64, uploadDir);
                    dadosAjuste.foto = nomeArquivo;
                    delete dadosAjuste.fotoBase64;
                } catch (e) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: "fotoBase64 inválida",
                        erro: e.message || e
                    });
                }
            }

            const resultado = await AjusteService.atualizar(req.params.id, dadosAjuste);
            return res.status(200).json({
                sucesso: true,
                mensagem: "Ajuste atualizado com sucesso!",
                dados: resultado
            });
        } catch (erro) { 
            return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.message || erro.mensagem });
        }
    }
}

module.exports = new AjusteController();