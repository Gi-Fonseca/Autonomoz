const db = require("../config/database");

class MovimentacaoRepository {
    async listar() {
        const query = `
            SELECT 
                m.id_movimentacao,
                m.id_entrada,
                m.id_saida,
                m.id_ajuste,
                e.quantidade AS entrada_quantidade,
                e.nf AS entrada_nf,
                s.quantidade AS saida_quantidade,
                s.motivo_saida,
                a.motivo_ajuste
            FROM movimentacao m
            LEFT JOIN entrada_produto e ON m.id_entrada = e.id_entrada
            LEFT JOIN saida_produto s ON m.id_saida = s.id_saida
            LEFT JOIN ajuste_produto a ON m.id_ajuste = a.id_ajuste
            ORDER BY m.id_movimentacao DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    async buscarPorId(id) {
        const query = `
            SELECT 
                m.id_movimentacao,
                m.id_entrada,
                m.id_saida,
                m.id_ajuste
            FROM movimentacao m
            WHERE m.id_movimentacao = ?
        `;
        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            const erro = new Error("Registro de movimentação não encontrado.");
            erro.status = 404;
            throw erro;
        }

        return rows[0];
    }

    async cadastrar(dados) {
        const { id_saida, id_entrada, id_ajuste } = dados;

        const query = `
            INSERT INTO movimentacao (id_saida, id_entrada, id_ajuste)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await db.execute(query, [
            id_saida || null,
            id_entrada || null,
            id_ajuste || null
        ]);

        return { id_movimentacao: resultado.insertId, ...dados };
    }

    async atualizar(id_movimentacao, dados) {
        const { id_saida, id_entrada, id_ajuste } = dados;

        const query = `
            UPDATE movimentacao
            SET id_saida = ?, id_entrada = ?, id_ajuste = ?
            WHERE id_movimentacao = ?
        `;

        const [resultado] = await db.execute(query, [
            id_saida || null,
            id_entrada || null,
            id_ajuste || null,
            id_movimentacao
        ]);

        if (resultado.affectedRows === 0) {
            const erro = new Error("Registro de movimentação não encontrado para atualização.");
            erro.status = 404;
            throw erro;
        }

        return { id_movimentacao: Number(id_movimentacao), ...dados };
    }

    async deletar(id_movimentacao) {
        const query = "DELETE FROM movimentacao WHERE id_movimentacao = ?";
        const [resultado] = await db.execute(query, [id_movimentacao]);

        if (resultado.affectedRows === 0) {
            const erro = new Error("Registro de movimentação não encontrado para exclusão.");
            erro.status = 404;
            throw erro;
        }

        return { id_movimentacao: Number(id_movimentacao) };
    }
}

module.exports = new MovimentacaoRepository();