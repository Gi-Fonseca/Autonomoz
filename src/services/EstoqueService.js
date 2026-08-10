const EstoqueRepository = require("../repositories/EstoqueRepository.js")

class EstoqueService{
    async listarEstoque(){
        const estoque = await EstoqueRepository.listarEstoque()

        return{
            sucesso: true,
            dados: estoque,
            total: estoque.length
        }
    }

    async buscarEstoqueId(id){
        if(!id || isNaN(id)){
            throw{
                status: 400,
                mensagem: "ID inválido"
            }
        }

        const estoque = await EstoqueRepository.buscarEstoqueId(id)

        if(!estoque){
            throw{
                status: 404,
                mensagem: "Estoque não encontrado"
            }
        }

        return{
            sucesso: true,
            dados: estoque
        }
    }

    async publicarEstoque(dados){
        const {id_produto, quantidade, valor_unitario, localizacao} = dados

        if(!id_produto || !quantidade || valor_unitario === undefined || !localizacao){
            throw{
                status: 400,
                mensagem: "id_produto, quantidade e valor_unitario são obrigatórios"
            }
        }

        if(isNaN(valor_unitario) || valor_unitario < 0){
            throw{
                status: 400,
                mensagem: "Valor_Unitario dever ser maior ou igual a 0"
            }
        }

        const novoEstoque = {
            id_produto: (id),
            quantidade: quantidade.trim(),
            valor_unitario,
            localizacao,
        }

        const id = await EstoqueRepository.publicarEstoque(novoEstoque)

        return{
            sucesso: true,
            mensagem: "Estoque cadastrado com sucesso", id
        }
    }

    async alterarDadosId(id, dados){
        if(!id || isNaN(id)){
            throw{
                status: 400,
                mensagem: "ID inválido"
            }
        }

        const estoque = await EstoqueRepository.buscarEstoqueId(id)

        if(!estoque){
            throw{
                status: 404,
                mensagem: "Estoque não encontrado"
            }
        }

        const estoqueAtualizado = {}

        const {id_produto, quantidade, valor_unitario, localizacao} = dados

        if(id_produto !== undefined){
            estoqueAtualizado.id_produto = id
        }

        if (quantidade !== undefined) {
            estoqueAtualizado.quantidade = quantidade.trim()
        }

        if(valor_unitario !== undefined){
            if(isNaN(valor_unitario) || valor_unitario < 0){
                throw{
                    status: 400,
                    mensagem: "Valor_Unitario dever ser maior ou igual a 0"
                }
            }

            estoqueAtualizado.valor_unitario = valor_unitario
        }

        if (localizacao !== undefined){
            estoqueAtualizado.localizacao = localizacao
        }

        if(Object.keys(estoqueAtualizado).length === 0){
            throw{
                status: 400,
                mensagem: "Nenhum dado enviado para atualização"
            }
        }

        await EstoqueRepository.alterarDadosId(id, estoqueAtualizado)

        return{
            sucesso: true,
            mensagem: "Estoque atualizado com sucesso"
        }
    }

    async deletarEstoque(id){
        if(!id || isNaN(id)){
            throw{
                status: 400,
                mensagem: "ID inválido"
            }
        }

        const estoque = await EstoqueRepository.buscarEstoqueId(id)

        if(!estoque){
            throw{
                status: 404,
                mensagem: "Estoque não encontrado"
            }
        }

        await EstoqueRepository.deletarEstoque(id)

        return{
            sucesso: true,
            mensagem: "Estoque removido com sucesso"
        }
    }
}

module.exports = new EstoqueService()