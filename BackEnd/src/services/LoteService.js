const LoteRepository = require('../repositories/LoteRepository')

class LoteService {
    // Lista lotes
    async listar() {
        return await LoteRepository.listar()
    }

    // Busca lote
    async buscarPorId(id) {
        return await LoteRepository.buscarPorId(id)
    }

    // Valida lote
    async criar(dados) {
        if (dados.quantidade === undefined) {
            throw {
                status: 400,
                mensagem: 'A quantidade é obrigatória'
            }
        }

        if (dados.quantidade < 0) {
            throw {
                status: 400,
                mensagem: 'A quantidade não pode ser negativa'
            }
        }

        const id = await LoteRepository.criar(dados)

        return {
            id_lote: id,
            quantidade: dados.quantidade
        }
    }

    // Atualiza lote
    async atualizar(id, dados) {
        const alterado = await LoteRepository.atualizar(id, dados)

        return {
            id_lote: id,
            alterado: alterado
        }
    }
}

module.exports = new LoteService()
