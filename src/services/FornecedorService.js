const FornecedorRepository = require('../repositories/FornecedorRepository')

class FornecedorService {
    // Lista fornecedores
    async listar() { return await FornecedorRepository.listar() }

    // Busca fornecedor
    async buscarPorId(id) { return await FornecedorRepository.buscarPorId(id) }

    // Valida fornecedor
    async criar(dados) {
        if (!dados.nome || !dados.cnpj || !dados.telefone || !dados.email) {
            throw { status: 400, mensagem: 'Nome, CNPJ, telefone e email são obrigatórios' }
        }
        const id = await FornecedorRepository.criar(dados)
        return { id_fornecedor: id, ...dados }
    }

    // Atualiza fornecedor
    async atualizar(id, dados) {
        const alterado = await FornecedorRepository.atualizar(id, dados)
        return { id_fornecedor: id, alterado }
    }

    // Exclui fornecedor
    async excluir(id) {
        const excluido = await FornecedorRepository.excluir(id)
        return { id_fornecedor: id, excluido }
    }
}

module.exports = new FornecedorService()
