const EntradaService = require("../services/EntradaService");
const { salvarFotoBase64 } = require("../utils/base64Helper");
const path = require("path");
const fs = require("fs");

class EntradaController {
    // Listar todas as entradas
    async listar(req, res) {
        try {
            const resultado = await EntradaService.listar();
            res.json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno do servidor",
                erro: erro.stack || erro
            });
        }
    }

    // Buscar entrada por ID
    async buscarPorId(req, res) {
        try {
            const resultado = await EntradaService.buscarPorId(req.params.id);
            res.json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno do servidor"
            });
        }
    }

    // Cadastrar entrada de produto (COM FOTO/COMPROVANTE BASE64)
    async cadastrar(req, res) {
        try {
            const dadosEntrada = req.body || {};

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Requisição sem corpo. Verifique Content-Type e o payload JSON."
                });
            }

            // Upload da foto do produto / nota fiscal em Base64
            if (!dadosEntrada.foto && dadosEntrada.fotoBase64) {
                const uploadDir = path.join(__dirname, "..", "..", "uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, {
                        recursive: true
                    });
                }

                let nomeArquivo;

                try {
                    nomeArquivo = salvarFotoBase64(
                        dadosEntrada.fotoBase64,
                        uploadDir
                    );
                } catch (e) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: "fotoBase64 inválida",
                        erro: e.message || e
                    });
                }

                dadosEntrada.foto = nomeArquivo;
                delete dadosEntrada.fotoBase64;
            }

            const resultado = await EntradaService.cadastrar(dadosEntrada);

            res.status(201).json(resultado);

        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao registrar entrada de produto",
                erro: erro.stack || erro
            });
        }
    }
}

module.exports = new EntradaController();