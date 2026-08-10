const CategoriaRepository = require('../repositories/CategoriaRepository.js');

class CategoriaService {

    async listarCategoria() {
        const categorias = await CategoriaRepository.listarCategoria();
        return {
            sucesso: true,
            dados: categorias,
            total: categorias.length
        };
    }

    async buscarCategoriaId(id) {
        if (!id || isNaN(id)) {
            throw { 
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const categoria = await CategoriaRepository.buscarCategoriaId(id);

        if (!categoria) {
            throw {
                status: 404,
                mensagem: 'Categoria não encontrada'
            };
        }

        return {
            sucesso: true,
            dados: categoria
        };
    }

    async publicarCategoria(dados) {
        const { id_produto, tipo_produto } = dados;

        if (!tipo_produto) {
            throw {
                status: 400,
                mensagem: 'O campo tipo_produto é obrigatório'
            };
        }

        const novaCategoria = {
            id_produto: id_produto ? Number(id_produto) : null,
            tipo_produto: tipo_produto.trim()
        };

        const resultado = await CategoriaRepository.publicarCategoria(novaCategoria);

        return {
            sucesso: true,
            mensagem: 'Categoria cadastrada com sucesso',
            dados: resultado
        };
    }

    async alterarDadosId(id, dados) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const categoriaExistente = await CategoriaRepository.buscarCategoriaId(id);

        if (!categoriaExistente) {
            throw {
                status: 404,
                mensagem: 'Categoria não encontrada'
            };
        }

        const { id_produto, tipo_produto } = dados;
        const categoriaAtualizada = {};

        if (id_produto !== undefined) {
            categoriaAtualizada.id_produto = Number(id_produto);
        }

        if (tipo_produto !== undefined && tipo_produto.trim() !== '') {
            categoriaAtualizada.tipo_produto = tipo_produto.trim();
        }

        await CategoriaRepository.alterarDadosId(id, categoriaAtualizada);

        return {
            sucesso: true,
            mensagem: 'Categoria atualizada com sucesso'
        };
    }

    async deletarCategoria(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const categoriaExistente = await CategoriaRepository.buscarCategoriaId(id);

        if (!categoriaExistente) {
            throw {
                status: 404,
                mensagem: 'Categoria não encontrada'
            };
        }

        await CategoriaRepository.deletarCategoria(id);

        return {
            sucesso: true,
            mensagem: 'Categoria apagada com sucesso'
        };
    }
}

module.exports = new CategoriaService();