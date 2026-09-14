const AjusteRepository = require('../repositories/AjusteRepository')

class AjusteService {
    // Lista ajustes
    async listar() { return await AjusteRepository.listar() }

    // Busca ajuste
    async buscarPorId(id) { return await AjusteRepository.buscarPorId(id) }

    // Valida ajuste
    async criar(dados) {
        if (!dados.id_produto || !dados.id_funcionario || !dados.data_ajuste || !dados.motivo_ajuste) {
            throw { status: 400, mensagem: 'Todos os campos do ajuste são obrigatórios' }
        }
        const id = await AjusteRepository.criar(dados)
        return { id_ajuste: id, ...dados }
    }

    // Atualiza ajuste
    async atualizar(id, dados) {
        const alterado = await AjusteRepository.atualizar(id, dados)
        return { id_ajuste: id, alterado }
    }
}

module.exports = new AjusteService()
