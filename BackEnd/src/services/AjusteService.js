const AjusteRepository = require('../repositories/AjusteRepository')

class AjusteService {
    // Lista ajustes
    async listar() { return await AjusteRepository.listar() }

    // Busca ajuste
    async buscarPorId(id) { return await AjusteRepository.buscarPorId(id) }

    // Valida ajuste
    async criar(dados) {
        const {id_produto, id_funcionario, quantidade_ajustada, data_ajuste, motivo_ajuste} = dados

        if (!dados.id_produto || !dados.id_funcionario || !dados.data_ajuste || !dados.motivo_ajuste) {
            throw { status: 400, mensagem: 'Todos os campos do ajuste são obrigatórios' }
        }

        if( quantidade_ajustada === undefined || quantidade_ajustada === null || isNaN(quantidade_ajustada)){
            throw{status: 400, mensagem: 'O campo "quantidade_ajustada" é obrigatório e deve ser numérico'}
        }

        if(Number(quantidade_ajustada) === 0){
            throw{status: 400, mensagem: 'O campo "quantidade_ajustada" não pode ser zero.'}
        }

        const id = await AjusteRepository.criar(dados)
        return { id_ajuste: id, ...dados }
    }

    // Atualiza ajuste
    async atualizar(id, dados) {
        const{quantidade_ajustada} = dados

        if(quantidade_ajustada !== undefined && Number(quantidade_ajustada) === 0){
            throw{status: 400, mensagem: 'O campo "quantidade_ajustada" não pode ser zero.'}
        }

        const alterado = await AjusteRepository.atualizar(id, dados)
        return { id_ajuste: id, alterado }
    }
}

module.exports = new AjusteService()
