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
    async listar() {
    const query = `
        SELECT e.*, p.nome AS produto_nome, f.nome AS funcionario_nome 
        FROM entrada_produto e
        LEFT JOIN produtos p ON e.id_produto = p.id_produto
        LEFT JOIN funcionario f ON e.id_funcionario = f.id
        ORDER BY e.id_entrada DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
}

async buscarPorId(id) {
    const query = `
        SELECT e.*, p.nome AS produto_nome, f.nome AS funcionario_nome 
        FROM entrada_produto e
        LEFT JOIN produtos p ON e.id_produto = p.id_produto
        LEFT JOIN funcionario f ON e.id_funcionario = f.id
        WHERE e.id_entrada = ?
    `;
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
        const erro = new Error("Registro de entrada não encontrado.");
        erro.status = 404;
        throw erro;
    }

    return rows[0];
}
async atualizar(id_entrada, dados) {
    const { id_produto, id_funcionario, quantidade, valor_compra, nf, foto } = dados;

    const query = `
        UPDATE entrada_produto 
        SET id_produto = ?, 
            id_funcionario = ?, 
            quantidade = ?, 
            valor_compra = ?, 
            nf = ?,
            foto = COALESCE(?, foto)
        WHERE id_entrada = ?
    `;

    const [resultado] = await db.execute(query, [
        id_produto,
        id_funcionario,
        quantidade,
        valor_compra || null,
        nf || null,
        foto || null,
        id_entrada
    ]);

    if (resultado.affectedRows === 0) {
        const erro = new Error("Registro de entrada não encontrado para atualização.");
        erro.status = 404;
        throw erro;
    }

    return { id_entrada: Number(id_entrada), ...dados };
}
async deletar(id_entrada) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Remove primeiro os registros vinculados na tabela movimentacao
        await connection.execute(
            "DELETE FROM movimentacao WHERE id_entrada = ?",
            [id_entrada]
        );

        // 2. Agora sim, remove a entrada na tabela entrada_produto
        const [resultado] = await connection.execute(
            "DELETE FROM entrada_produto WHERE id_entrada = ?",
            [id_entrada]
        );

        if (resultado.affectedRows === 0) {
            const erro = new Error("Registro de entrada não encontrado para exclusão.");
            erro.status = 404;
            throw erro;
        }

        // Confirma as duas alterações no banco
        await connection.commit();

        return { id_entrada: Number(id_entrada) };

    } catch (error) {
        // Se der qualquer erro em alguma das etapas, desfazer as operações
        await connection.rollback();
        throw error;
    } finally {
        // Libera a conexão com o banco de dados
        connection.release();
    }
}
}

module.exports = new EntradaRepository();