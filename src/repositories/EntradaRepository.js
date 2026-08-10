const db = require("../config/database");

class EntradaRepository {
    async cadastrar(dados) {
        const { id_produto, id_funcionario, quantidade, valor_compra, nf, foto, id_estoque } = dados;
        const connection = await db.getConnection();

        try {
            // Inicia a Transação
            await connection.beginTransaction();

            // 1. Grava no banco a entrada de produto
            const queryEntrada = `
                INSERT INTO entrada_produto (id_produto, id_funcionario, quantidade, valor_compra, nf)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [resEntrada] = await connection.execute(queryEntrada, [
                id_produto,
                id_funcionario,
                quantidade,
                valor_compra,
                nf || null
            ]);

            const id_entrada = resEntrada.insertId;

            // 2. Soma a quantidade que entrou na tabela 'produtos'
            const queryUpdateProduto = `
                UPDATE produtos 
                SET quantidade = quantidade + ?
                ${foto ? ', foto = ?' : ''} 
                WHERE id_produto = ?
            `;

            const paramsUpdate = foto 
                ? [quantidade, foto, id_produto] 
                : [quantidade, id_produto];

            await connection.execute(queryUpdateProduto, paramsUpdate);

            // 3. Insere o registro na tabela movimentacao
            const queryMovimentacao = `
                INSERT INTO movimentacao (id_entrada, id_estoque)
                VALUES (?, ?)
            `;
            await connection.execute(queryMovimentacao, [id_entrada, id_estoque || null]);

            // Confirma todas as queries
            await connection.commit();

            return {
                id_entrada,
                id_produto,
                id_funcionario,
                quantidade_adicionada: quantidade,
                valor_compra,
                nf: nf || null
            };

        } catch (error) {
            // Se algo der errado, desfaz as alterações no banco
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new EntradaRepository();