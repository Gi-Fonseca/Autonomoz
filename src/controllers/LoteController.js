const LoteService = require('../services/LoteService')

class LoteController {
    // Lista lotes
    async listar(req, res) {
        try {
            const lotes = await LoteService.listar()

            res.json(lotes)
        } catch (erro) {
            res.status(500).json({
                mensagem: erro.message || erro.mensagem
            })
        }
    }

    // Busca lote
    async buscarPorId(req, res) {
        try {
            const lote = await LoteService.buscarPorId(req.params.id)

            res.json(lote)
        } catch (erro) {
            res.status(500).json({
                mensagem: erro.message || erro.mensagem
            })
        }
    }

    // Cria lote
    async criar(req, res) {
        try {
            const lote = await LoteService.criar(req.body)

            res.status(201).json(lote)
        } catch (erro) {
            res.status(erro.status || 500).json({
                mensagem: erro.message || erro.mensagem
            })
        }
    }

    // Atualiza lote
    async atualizar(req, res) {
        try {
            const lote = await LoteService.atualizar(
                req.params.id,
                req.body
            )

            res.json(lote)
        } catch (erro) {
            res.status(erro.status || 500).json({
                mensagem: erro.message || erro.mensagem
            })
        }
    }
}

module.exports = new LoteController()
