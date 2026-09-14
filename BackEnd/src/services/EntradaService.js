const EntradaRepository = require("../repositories/EntradaRepository");

class EntradaService {
    async cadastrar(dados) {
        const { id_produto, id_funcionario, quantidade, valor_compra } = dados;

        // Validação de Chaves Estrangeiras Obrigatórias
        if (!id_produto || !id_funcionario) {
            const erro = new Error("Campos 'id_produto' e 'id_funcionario' são obrigatórios.");
            erro.status = 400;
            throw erro;
        }

        // Validação da Quantidade (NOT NULL e deve ser maior que 0)
        if (quantidade === undefined || quantidade === null || quantidade <= 0) {
            const erro = new Error("A quantidade inserida deve ser maior que zero.");
            erro.status = 400;
            throw erro;
        }

        // Validação do Valor da Compra (CHECK >= 0)
        if (valor_compra === undefined || valor_compra === null || valor_compra < 0) {
            const erro = new Error("O valor de compra é obrigatório e deve ser maior ou igual a zero.");
            erro.status = 400;
            throw erro;
        }

        
        return await EntradaRepository.cadastrar(dados);
    }
    async listar() {
    return await EntradaRepository.listar();
}

async buscarPorId(id) {
    if (!id || isNaN(id)) {
        const erro = new Error("ID de entrada inválido.");
        erro.status = 400;
        throw erro;
    }
    return await EntradaRepository.buscarPorId(id);
}
// Adicione este método no seu EntradaService.js se ainda não tiver adicionado:

async atualizar(id, dados) {
    if (!id || isNaN(id)) {
        const erro = new Error("ID da entrada inválido.");
        erro.status = 400;
        throw erro;
    }

    const { id_produto, id_funcionario } = dados;

    if (!id_produto || !id_funcionario) {
        const erro = new Error("Campos 'id_produto' e 'id_funcionario' são obrigatórios.");
        erro.status = 400;
        throw erro;
    }

    return await EntradaRepository.atualizar(id, dados);
}
async deletar(id) {
    if (!id || isNaN(id)) {
        const erro = new Error("ID da entrada inválido.");
        erro.status = 400;
        throw erro;
    }

    return await EntradaRepository.deletar(id);
}
}

module.exports = new EntradaService();