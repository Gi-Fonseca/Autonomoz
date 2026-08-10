const ProdutoRepository = require("../repositories/ProdutoRepository");

class ProdutoService {

    async listarProdutos() {
        const produtos = await ProdutoRepository.listarProdutos();

        return {
            sucesso: true,
            dados: produtos,
            total: produtos.length
        };
    }

    async buscarProdutoId(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const produto = await ProdutoRepository.buscarProdutoId(id);

        if (!produto) {
            throw {
                status: 404,
                mensagem: "Produto não encontrado"
            };
        }

        return {
            sucesso: true,
            dados: produto
        };
    }

    async publicarProduto(dados) {

        const { marca, nome, quantidade, id_categoria } = dados;

        if (!marca || !nome || quantidade === undefined || !id_categoria) {
            throw {
                status: 400,
                mensagem: "Marca, nome, quantidade e categoria são obrigatórios"
            };
        }

        if (isNaN(quantidade) || quantidade < 0) {
            throw {
                status: 400,
                mensagem: "Quantidade deve ser um número maior ou igual a 0"
            };
        }

        const novoProduto = {
            marca: marca.trim(),
            nome: nome.trim(),
            quantidade,
            id_categoria
        };

        const id = await ProdutoRepository.publicarProduto(novoProduto);

        return {
            sucesso: true,
            mensagem: "Produto cadastrado com sucesso",
            id
        };
    }

    async alterarDados(id, dados) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const produto = await ProdutoRepository.buscarProdutoId(id);

        if (!produto) {
            throw {
                status: 404,
                mensagem: "Produto não encontrado"
            };
        }

        const produtoAtualizado = {};

        const { marca, nome, quantidade, id_categoria } = dados;

        if (marca !== undefined) {
            produtoAtualizado.marca = marca.trim();
        }

        if (nome !== undefined) {
            produtoAtualizado.nome = nome.trim();
        }

        if (quantidade !== undefined) {

            if (isNaN(quantidade) || quantidade < 0) {
                throw {
                    status: 400,
                    mensagem: "Quantidade deve ser um número maior ou igual a 0"
                };
            }

            produtoAtualizado.quantidade = quantidade;
        }

        if (id_categoria !== undefined) {
            produtoAtualizado.id_categoria = id_categoria;
        }

        if (Object.keys(produtoAtualizado).length === 0) {
            throw {
                status: 400,
                mensagem: "Nenhum dado enviado para atualização"
            };
        }

        await ProdutoRepository.alterarDados(id, produtoAtualizado);

        return {
            sucesso: true,
            mensagem: "Produto atualizado com sucesso"
        };
    }

    async deletarProduto(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const produto = await ProdutoRepository.buscarProdutoId(id);

        if (!produto) {
            throw {
                status: 404,
                mensagem: "Produto não encontrado"
            };
        }

        await ProdutoRepository.deletarProduto(id);

        return {
            sucesso: true,
            mensagem: "Produto removido com sucesso"
        };
    }

}

module.exports = new ProdutoService();