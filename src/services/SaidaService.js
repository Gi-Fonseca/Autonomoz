const SaidaRepository = require("../repositories/SaidaRepository");

class SaidaService {
    async cadastrar(dados) {
        const { id_produto, id_funcionario, quantidade, motivo_saida, valor_venda } = dados;

        // Validação de Chaves Estrangeiras Obrigatórias
        if (!id_produto || !id_funcionario) {
            const erro = new Error("Campos 'id_produto' e 'id_funcionario' são obrigatórios.");
            erro.status = 400;
            throw erro;
        }

        // Validação da Quantidade (NOT NULL e > 0)
        if (!quantidade || quantidade <= 0) {
            const erro = new Error("A quantidade de saída deve ser maior que zero.");
            erro.status = 400;
            throw erro;
        }

        // Validação do Motivo da Saída (NOT NULL na sua tabela)
        if (!motivo_saida || typeof motivo_saida !== "string" || motivo_saida.trim() === "") {
            const erro = new Error("O campo 'motivo_saida' é obrigatório (ex: 'Venda', 'Avaria', 'Descarte').");
            erro.status = 400;
            throw erro;
        }

        // Validação do Valor de Venda (CHECK valor_venda >= 0)
        if (valor_venda !== undefined && valor_venda !== null && valor_venda < 0) {
            const erro = new Error("O valor de venda deve ser maior ou igual a zero.");
            erro.status = 400;
            throw erro;
        }

        return await SaidaRepository.cadastrar(dados);
    }
}

module.exports = new SaidaService();