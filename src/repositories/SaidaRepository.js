const db = require("../config/database");

class SaidaRepository {
    async cadastrar(dados) {
        const { id_produto, id_funcionario, quantidade, motivo_saida, valor_venda, nf, id_estoque } = dados;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Verifica se o produto existe e se há estoque suficiente
            const [produtos] = await connection.execute(
                "SELECT quantidade FROM produtos WHERE id_produto = ?",
                [id_produto]
            );

            if (produtos.length === 0) {
                const erro = new Error("Produto não encontrado.");
                erro.status = 404;
                throw erro;
            }

            const estoqueAtual = produtos[0].quantidade;

            if (estoqueAtual < quantidade) {
                const erro = new Error(`Estoque insuficiente. Estoque atual: ${estoqueAtual}, solicitado: ${quantidade}`);
                erro.status = 400;
                throw erro;
            }

            // 2. Insere na tabela 'saida_produto'
            const querySaida = `
                INSERT INTO saida_produto (id_produto, id_funcionario, quantidade, motivo_saida, valor_venda, nf)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [resSaida] = await connection.execute(querySaida, [
                id_produto,
                id_funcionario,
                quantidade,
                motivo_saida,
                valor_venda !== undefined ? valor_venda : null,
                nf || null
            ]);

            const id_saida = resSaida.insertId;

            // 3. Subtrai a quantidade vendida/saída do estoque de produtos
            const queryUpdateProduto = `
                UPDATE produtos 
                SET quantidade = quantidade - ?
                WHERE id_produto = ?
            `;
            await connection.execute(queryUpdateProduto, [quantidade, id_produto]);

            // 4. Grava no histórico da tabela movimentacao
            const queryMovimentacao = `
                INSERT INTO movimentacao (id_saida, id_estoque)
                VALUES (?, ?)
            `;
            await connection.execute(queryMovimentacao, [id_saida, id_estoque || null]);

            await connection.commit();

            return {
                id_saida,
                id_produto,
                id_funcionario,
                quantidade_removida: quantidade,
                motivo_saida,
                valor_venda: valor_venda || null,
                nf: nf || null,
                estoque_restante: estoqueAtual - quantidade
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new SaidaRepository();