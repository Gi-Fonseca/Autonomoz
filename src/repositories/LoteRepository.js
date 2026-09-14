const pool = require('../config/database.js' )

class LoteRepository {
    // Lista lotes
    async listar() {
        const [lotes] = await pool.query(
            'SELECT * FROM lote'
        )

        return lotes
    }

    // Busca lote
    async buscarPorId(id) {
        const [lotes] = await pool.query(
            'SELECT * FROM lote WHERE id_lote = ?',
            [id]
        )

        return lotes[0]
    }

    // Cria lote
    async criar(dados) {
        const { quantidade } = dados

        const [resultado] = await pool.query(
            'INSERT INTO lote (quantidade) VALUES (?)',
            [quantidade]
        )

        return resultado.insertId
    }

    // Atualiza lote
    async atualizar(id, dados) {
        const { quantidade } = dados

        const [resultado] = await pool.query(
            'UPDATE lote SET quantidade = ? WHERE id_lote = ?',
            [quantidade, id]
        )

        return resultado.affectedRows
    }
}

module.exports = new LoteRepository()
