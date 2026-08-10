const EntradaService = require("../services/EntradaService");
const { salvarFotoBase64 } = require("../utils/base64Helper");
const path = require("path");
const fs = require("fs");

class EntradaController {
    async cadastrar(req, res) {
        try {
            const dadosEntrada = req.body || {};

            // Validar se o corpo da requisição veio vazio
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Requisição sem corpo. Verifique o Content-Type e o payload JSON."
                });
            }

            // Tratamento da imagem Base64 (salva no servidor e envia apenas o nome do arquivo)
            if (!dadosEntrada.foto && dadosEntrada.fotoBase64) {
                const uploadDir = path.join(__dirname, "..", "..", "uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                try {
                    const nomeArquivo = salvarFotoBase64(
                        dadosEntrada.fotoBase64,
                        uploadDir
                    );
                    dadosEntrada.foto = nomeArquivo;
                    delete dadosEntrada.fotoBase64;
                } catch (e) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: "fotoBase64 inválida",
                        erro: e.message || e
                    });
                }
            }

            const resultado = await EntradaService.cadastrar(dadosEntrada);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Entrada registrada com sucesso!",
                dados: resultado
            });

        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao registrar entrada de produto",
                erro: erro.stack || erro
            });
        }
    }
}

module.exports = new EntradaController();