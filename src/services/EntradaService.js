const EntradaRepository = require("../repositories/EntradaRepository");

class EntradaService {
    async listar() {
        return await EntradaRepository.listar();
    }

    async buscarPorId(id) {
        const entrada = await EntradaRepository.buscarPorId(id);
        if (!entrada) {
            const erro = new Error("Registro de entrada não encontrado");
            erro.status = 404;
            throw erro;
        }
        return entrada;
    }

    async cadastrar(dados) {
        const { id_produto, id_funcionario, quantidade, valor_compra } = dados;

        // Validações das regras do negócio
        if (!id_produto || !id_funcionario) {
            const erro = new Error("id_produto e id_funcionario são obrigatórios");
            erro.status = 400;
            throw erro;
        }

        if (!quantidade || quantidade <= 0) {
            const erro = new Error("A quantidade deve ser maior que zero");
            erro.status = 400;
            throw erro;
        }

        if (valor_compra === undefined || valor_compra < 0) {
            const erro = new Error("O valor de compra deve ser maior ou igual a zero");
            erro.status = 400;
            throw erro;
        }

        return await EntradaRepository.cadastrar(dados);
    }
}

module.exports = new EntradaService();