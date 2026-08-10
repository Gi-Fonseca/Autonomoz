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
}

module.exports = new EntradaService();