const CategoriaRepository = require('../repositories/CategoriaRepository.js')

class CategoriaService{
    async listarCategoria(){
        const categoria = await CategoriaRepository.listarCategoria()
        return{
            sucesso: true,
            dados: categorias,
            total: categorias.lenght
        }
    }

    async buscarCategoriaId(id){
        if (!id || isNaN(id)){
            throw{ 
                status: 400,
                mensagem: 'ID inválido'
            }
        }

        const categoria = await CategoriaRepository.buscarCategoriaId(id)

        if(!categoria){
            throw{
                status: 404,
                mensagem: 'Categoria não encontrada'
            }
        }

        return{
            sucesso: true,
            dados: categoria
        }
    }

    async publicarCategoria(dados){
        const{id_produto, tipo_produto} = dados

        if(!id_produto || tipo_produto === undefined){
            throw{
                status: 400,
                mensagem: 'ID_produto e Tipo_produto são obrigatórios'
            }
        }

        const novaCategoria = {
            id_produto: id_produto(id),
            tipo_produto: tipo_produto.trim()
        }

        const resultado = await CategoriaRepository.publicarCategoria(novaCategoria)

        return{
            sucesso: true,
            mensagem: 'Categoria cadastrada com sucesso',
            resultado
        }
    }

    async alterarDadosId(id, dados){
        if(!id || isNaN(id)){
            throw{
                status: 400,
                mensagem: 'Id Inválido'
            }
        }

        const categoriaId = await CategoriaRepository.buscarCategoriaId(id)

        if(!categoriaId){
            throw{
                status: 404,
                mensagem: 'Categoria não encontrada'
            }
        }

        const categoriaAtualizada = {}

        const {id_produto, tipo_produto} = dados

        if(id_produto !== undefined && (id) !== '')
            categoriaAtualizada.id_produto = (id)

        if(tipo_produto !== undefined) categoriaAtualizada.tipo_produto = tipo_produto.trim()
    }
    categoriaAtualizada = tipo_produto

    await CategoriaRepository.alterarDadosId(id, categoriaAtualizada)

    return{
        sucesso: true,
        mensagem: 'Categoria Atualizada'
    }

    async deletarCategoria(id){
        if(!id || isNaN(id)){
            throw{
                status: 400,
                mensagem: "Id inválido"
            }
        }

        const idCategoria = await CategoriaRepository.buscarCategoriaId(id)

        if(!idCategoria){
            throw{
                status: 404,
                mensagem: 'Produto não encontrado'
            }
        }

        await CategoriaRepository.deletarCategoria(id)

        return{
            sucesso: true,
            mensagem: 'Categoria apagada'
        }
    }
}

module.exports = new CategoriaService()