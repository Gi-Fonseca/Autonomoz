const ProdutoService = require('../services/produtoService.js')

class ProdutoController{
        async listarProduto(req,res){
            try {
                const resultado = await ProdutoService.listarProdutos()
                res.json(resultado)
            } catch (erro) {
                res.status(erro.status || 500).json({
                    sucesso: false,
                    mensagem: erro.mensagem || "Erro interno do servidor",
                    erro: erro.stack || erro 
                })
            }
        }

        async buscarProdutoId(req,res){
            try {
                const resultado = await ProdutoService.buscarProdutoId(req.params.id)
                res.json(resultado)
            } catch (erro) {
                res.status(erro.status || 500).json({
                    sucesso: false,
                    mensagem: erro.mensagem || "Erro interno no servidor",
                    erro: erro.stack || erro
                })
            }
    }

        async publicarProduto(req,res){
            try {
                const resultado = await ProdutoService.publicarProduto(req.body)
                res.json(resultado)
            } catch (erro) {
                res.status(erro.status || 500).json({
                    sucesso: false,
                    mensagem: erro.mensagem || "Erro interno no servidor",
                    erro: erro.stack || erro
                })
            }
        }

        async alterarDados(req,res){
            try {
                const resultado = await ProdutoService.alterarDados(req.params.id, req.body)
                res.json(resultado)
            } catch (erro) {
                res.status(erro.status || 500).json({
                    sucesso: false,
                    mensagem: erro.mensagem || "Erro interno no servidor",
                    erro: erro.stack || erro
                })
            }
        }

        async deletarProduto(req,res){
            try {
                const resultado = await ProdutoService.deletarProduto(req.params.id)
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

module.exports = new ProdutoController()