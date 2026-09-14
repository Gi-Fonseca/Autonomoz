const EstoqueRepository = require("../repositories/EstoqueRepository.js");

class EstoqueService {
    async listarEstoque() {
        const estoque = await EstoqueRepository.listarEstoque();

        return {
            sucesso: true,
            dados: estoque,
            total: estoque.length
        };
    }

    async buscarEstoqueId(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const estoque = await EstoqueRepository.buscarEstoqueId(id);

        if (!estoque) {
            throw {
                status: 404,
                mensagem: "Estoque não encontrado"
            };
        }

        return {
            sucesso: true,
            dados: estoque
        };
    }

    async publicarEstoque(dados) {
        const { id_produto, quantidade, valor_unitario, localizacao } = dados;

        // Validações de obrigatoriedade
        if (!id_produto || quantidade === undefined || valor_unitario === undefined) {
            throw {
                status: 400,
                mensagem: "id_produto, quantidade e valor_unitario são obrigatórios"
            };
        }

        if (isNaN(valor_unitario) || valor_unitario < 0) {
            throw {
                status: 400,
                mensagem: "Valor unitário deve ser maior ou igual a 0"
            };
        }

        if (isNaN(quantidade) || quantidade < 0) {
            throw {
                status: 400,
                mensagem: "Quantidade deve ser maior ou igual a 0"
            };
        }

        const novoEstoque = {
            id_produto,
            quantidade: Number(quantidade),
            valor_unitario: Number(valor_unitario),
            localizacao: localizacao ? localizacao.trim() : null
        };

        // Declaramos e geramos o ID aqui
        const idCriado = await EstoqueRepository.publicarEstoque(novoEstoque);

        return {
            sucesso: true,
            mensagem: "Estoque cadastrado com sucesso",
            dados: {
                id_estoque: idCriado,
                ...novoEstoque
            }
        };
    }

    async alterarDadosId(id, dados) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const estoqueExistente = await EstoqueRepository.buscarEstoqueId(id);

        if (!estoqueExistente) {
            throw {
                status: 404,
                mensagem: "Estoque não encontrado"
            };
        }

        const estoqueAtualizado = {};
        const { id_produto, quantidade, valor_unitario, localizacao } = dados;

        if (id_produto !== undefined) {
            estoqueAtualizado.id_produto = id_produto;
        }

        if (quantidade !== undefined) {
            estoqueAtualizado.quantidade = Number(quantidade);
        }

        if (valor_unitario !== undefined) {
            if (isNaN(valor_unitario) || valor_unitario < 0) {
                throw {
                    status: 400,
                    mensagem: "Valor unitário deve ser maior ou igual a 0"
                };
            }
            estoqueAtualizado.valor_unitario = Number(valor_unitario);
        }

        if (localizacao !== undefined) {
            estoqueAtualizado.localizacao = localizacao.trim();
        }

        if (Object.keys(estoqueAtualizado).length === 0) {
            throw {
                status: 400,
                mensagem: "Nenhum dado enviado para atualização"
            };
        }

        await EstoqueRepository.alterarDadosId(id, estoqueAtualizado);

        return {
            sucesso: true,
            mensagem: "Estoque atualizado com sucesso"
        };
    }

    async deletarEstoque(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const estoque = await EstoqueRepository.buscarEstoqueId(id);

        if (!estoque) {
            throw {
                status: 404,
                mensagem: "Estoque não encontrado"
            };
        }

        await EstoqueRepository.deletarEstoque(id);

        return {
            sucesso: true,
            mensagem: "Estoque removido com sucesso"
        };
    }
}

module.exports = new EstoqueService();