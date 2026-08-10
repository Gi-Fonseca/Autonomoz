const SaidaService = require("../services/SaidaService");

class SaidaController {
    async cadastrar(req, res) {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Requisição sem corpo. Verifique o payload JSON."
                });
            }

            const resultado = await SaidaService.cadastrar(req.body);

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
}

module.exports = new SaidaController();