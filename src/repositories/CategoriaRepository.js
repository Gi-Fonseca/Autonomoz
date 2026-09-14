const pool = require('../config/database.js')

class CategoriaRepository {
    // Lista categorias
    async listarCategoria() {
        const [rows] = await pool.query(
            'SELECT * FROM categoria'
        )

        return rows
    }

    // Busca categoria
    async buscarCategoriaId(id) {
        const [rows] = await pool.query(
            'SELECT * FROM categoria WHERE id_categoria = ?',
            [id]
        )

        return rows[0]
    }

    // Cria categoria
    async publicarCategoria(dadosCategoria) {
        const { tipo_produto } = dadosCategoria

        const [resultado] = await pool.query(
            'INSERT INTO categoria (tipo_produto) VALUES (?)',
            [tipo_produto]
        )

        return resultado.insertId
    }

    // Atualiza categoria
    async alterarDadosId(id, dadosCategoria) {
        const { tipo_produto } = dadosCategoria

        const [resultado] = await pool.query(
            `UPDATE categoria
             SET tipo_produto = ?
             WHERE id_categoria = ?`,
            [tipo_produto, id]
        )

        return resultado.affectedRows
    }

    // Exclui categoria
    async deletarCategoria(id) {
        const [resultado] = await pool.query(
            'DELETE FROM categoria WHERE id_categoria = ?',
            [id]
        )

        return resultado.affectedRows
    }
}

module.exports = new CategoriaRepository()
