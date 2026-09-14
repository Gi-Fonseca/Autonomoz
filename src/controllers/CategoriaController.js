const CategoriaService = require('../services/categoriaService')

class CategoriaController {
    async listarCategoria(req, res) {
        try {
            const resultado = await CategoriaService.listarCategoria()
            res.json(resultado)
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno do servidor",
                erro: erro.stack || erro
            })
        }
    }

    async buscarCategoriaId(req, res) {
        try {
            const resultado = await CategoriaService.buscarCategoriaId(req.params.id)
            res.json(resultado)
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor",
                erro: erro.stack || erro
            })
        }
    }

    async publicarCategoria(req, res) {
        try {
            const resultado = await CategoriaService.publicarCategoria(req.body)
            res.json(resultado)
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor",
                erro: erro.stack || erro
            })
        }
    }

    async alterarDadosId(req, res) {
        try {
            const resultado = await CategoriaService.alterarDadosId(req.params.id, req.body)
            res.json(resultado)
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor",
                erro: erro.stack || erro
            })
        }
    }

    async deletarCategoria(req, res) {
        try {
            const resultado = await CategoriaService.deletarCategoria(req.params.id)
            res.json(resultado)
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor",
                erro: erro.stack || erro
            })
        }
    }
}

module.exports = new CategoriaController()
