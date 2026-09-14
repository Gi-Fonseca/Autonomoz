const ClienteRepository = require('../repositories/ClienteRepository')

class ClienteService {
    // Lista clientes
    async listar() {
        return await ClienteRepository.listar()
    }

    // Busca cliente
    async buscarPorId(id) {
        return await ClienteRepository.buscarPorId(id)
    }

    // Valida cliente
    async criar(dados) {
        if (!dados.nome || !dados.email) {
            throw {
                status: 400,
                mensagem: 'Nome e email são obrigatórios'
            }
        }
        const id = await ClienteRepository.criar(dados)
        return { id_cliente: id, ...dados }
    }

    // Atualiza cliente
    async atualizar(id, dados) {
        const alterado = await ClienteRepository.atualizar(id, dados)
        return { id_cliente: id, alterado }
    }

    // Exclui cliente
    async excluir(id) {
        const excluido = await ClienteRepository.excluir(id)
        return { id_cliente: id, excluido }
    }
}

module.exports = new ClienteService()
