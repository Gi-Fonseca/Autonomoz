const AjusteService = require('../services/AjusteService')

class AjusteController {
    // Lista ajustes
    async listar(req, res) {
        try { res.json(await AjusteService.listar()) }
        catch (erro) { res.status(500).json({ mensagem: erro.message || erro.mensagem }) }
    }

    // Busca ajuste
    async buscarPorId(req, res) {
        try { res.json(await AjusteService.buscarPorId(req.params.id)) }
        catch (erro) { res.status(500).json({ mensagem: erro.message || erro.mensagem }) }
    }

    // Cria ajuste
    async criar(req, res) {
        try { res.status(201).json(await AjusteService.criar(req.body)) }
        catch (erro) { res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem }) }
    }

    // Atualiza ajuste
    async atualizar(req, res) {
        try { res.json(await AjusteService.atualizar(req.params.id, req.body)) }
        catch (erro) { res.status(erro.status || 500).json({ mensagem: erro.message || erro.mensagem }) }
    }
}

module.exports = new AjusteController()
