const db = require("../config/database");

class EntradaRepository {
    async listar() {
        const [linhas] = await db.execute(`
            SELECT e.*, p.nome AS produto_nome, f.nome AS funcionario_nome 
            FROM entrada_produto e
            LEFT JOIN produtos p ON e.id_produto = p.id_produto
            LEFT JOIN funcionario f ON e.id_funcionario = f.id
            ORDER BY e.data_entrada DESC
        `);
        return linhas;
    }

    async buscarPorId(id) {
        const [linhas] = await db.execute(`
            SELECT e.*, p.nome AS produto_nome, f.nome AS funcionario_nome 
            FROM entrada_produto e
            LEFT JOIN produtos p ON e.id_produto = p.id_produto
            LEFT JOIN funcionario f ON e.id_funcionario = f.id
            WHERE e.id_entrada = ?
        `, [id]);
        return linhas[0] || null;
    }

    async cadastrar(dados) {
        const { id_produto, id_funcionario, quantidade, valor_compra, nf, foto, id_estoque } = dados;

        const connection = await db.getConnection();

        try {
            // Inicia Transação
            await connection.beginTransaction();

            // 1. Salva a entrada do produto
            const queryEntrada = `
                INSERT INTO entrada_produto (id_produto, id_funcionario, quantidade, valor_compra, nf, foto)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [resEntrada] = await connection.execute(queryEntrada, [
                id_produto,
                id_funcionario,
                quantidade,
                valor_compra,
                nf || null,
                foto || null
            ]);

            const id_entrada = resEntrada.insertId;

            // 2. Incrementa a quantidade na tabela produtos
            const queryUpdateProduto = `
                UPDATE produtos 
                SET quantidade = quantidade + ? 
                WHERE id_produto = ?
            `;
            await connection.execute(queryUpdateProduto, [quantidade, id_produto]);

            // 3. Registra na tabela movimentacao
            const queryMovimentacao = `
                INSERT INTO movimentacao (id_entrada, id_estoque)
                VALUES (?, ?)
            `;
            await connection.execute(queryMovimentacao, [id_entrada, id_estoque || null]);

            // Confirma tudo no banco
            await connection.commit();

            return {
                sucesso: true,
                mensagem: "Entrada cadastrada e quantidade do produto atualizada!",
                id_entrada
            };

        } catch (error) {
            // Desfaz tudo se falhar
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new EntradaRepository();