const CategoriaRepository =
    require('../repositories/CategoriaRepository.js')

class CategoriaService {
    // Lista categorias
    async listarCategoria() {
        return await CategoriaRepository.listarCategoria()
    }

    // Busca categoria
    async buscarCategoriaId(id) {
        return await CategoriaRepository.buscarCategoriaId(id)
    }

    // Valida categoria
    async publicarCategoria(dados) {
        const { tipo_produto } = dados

        if (!tipo_produto || tipo_produto.trim() === '') {
            throw {
                status: 400,
                mensagem: 'O campo tipo_produto é obrigatório'
            }
        }

        const id = await CategoriaRepository.publicarCategoria({
            tipo_produto: tipo_produto.trim()
        })

        return {
            sucesso: true,
            mensagem: 'Categoria cadastrada com sucesso',
            dados: {
                id_categoria: id,
                tipo_produto: tipo_produto.trim()
            }
        }
    }

    // Atualiza categoria
    async alterarDadosId(id, dados) {
        const { tipo_produto } = dados

        if (!tipo_produto || tipo_produto.trim() === '') {
            throw {
                status: 400,
                mensagem: 'O campo tipo_produto é obrigatório'
            }
        }

        return await CategoriaRepository.alterarDadosId(id, {
            tipo_produto: tipo_produto.trim()
        })
    }

    // Exclui categoria
    async deletarCategoria(id) {
        return await CategoriaRepository.deletarCategoria(id)
    }
}

module.exports = new CategoriaService()
