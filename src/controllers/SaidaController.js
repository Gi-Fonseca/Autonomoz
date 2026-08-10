const SaidaService = require("../services/SaidaService");
const { salvarFotoBase64 } = require("../utils/base64Helper");
const path = require("path");
const fs = require("fs");

class SaidaController {
    
    // Listar todas as saídas
    async listar(req, res) {
        try {
            const saidas = await SaidaService.listar();
            return res.status(200).json({ sucesso: true, dados: saidas });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao buscar saídas",
                erro: erro.stack || erro
            });
        }
    }

    // Buscar por ID
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const saida = await SaidaService.buscarPorId(id);
            return res.status(200).json({ sucesso: true, dados: saida });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao buscar saída",
                erro: erro.stack || erro
            });
        }
    }

    // Cadastrar Saída
    async cadastrar(req, res) {
        try {
            const dadosSaida = req.body || {};

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Requisição sem corpo. Verifique o JSON enviado."
                });
            }

            // Tratamento de foto em Base64 (se houver)
            if (!dadosSaida.foto && dadosSaida.fotoBase64) {
                const uploadDir = path.join(__dirname, "..", "..", "uploads");
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const nomeArquivo = salvarFotoBase64(dadosSaida.fotoBase64, uploadDir);
                dadosSaida.foto = nomeArquivo;
                delete dadosSaida.fotoBase64;
            }

            const resultado = await SaidaService.cadastrar(dadosSaida);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Saída registrada com sucesso!",
                dados: resultado
            });

        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao registrar saída de produto",
                erro: erro.stack || erro
            });
        }
    }

    // Atualizar Saída
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dadosSaida = req.body || {};

            const resultado = await SaidaService.atualizar(id, dadosSaida);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Saída atualizada com sucesso!",
                dados: resultado
            });

        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao atualizar saída de produto",
                erro: erro.stack || erro
            });
        }
    }

    // Deletar Saída
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await SaidaService.deletar(id);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Saída excluída com sucesso!",
                dados: resultado
            });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro ao excluir saída de produto",
                erro: erro.stack || erro
            });
        }
    }
}

module.exports = new SaidaController();