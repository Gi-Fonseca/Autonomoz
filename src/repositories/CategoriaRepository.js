const pool = require('../config/database.js')

class CategoriaRepository {
    async listarCategoria() {
        const [rows] = await pool.query('SELECT * FROM categoria')
        return rows
    }

    async buscarCategoriaId(id) {
        const [rows] = await pool.query('SELECT * FROM categoria WHERE id_categoria = ?', [id])
        return rows[0]
    }

    async publicarCategoria(dadosCategoria) {
        // Garantimos que APENAS tipo_produto vá para o comando SQL
        const tipo_produto = dadosCategoria.tipo_produto
        const [resultadoPublicar] = await pool.query(
            'INSERT INTO categoria (tipo_produto) VALUES (?)',
            [tipo_produto]
        )
        return resultadoPublicar.insertId
    }

    async alterarDadosId(id, dadosCategoria) {
        const camposCategoria = []
        const valoresCategoria = []

        for (const [key, value] of Object.entries(dadosCategoria)) {
            // Ignora qualquer campo que não seja 'tipo_produto' (como id_produto)
            if (key === 'tipo_produto') {
                camposCategoria.push(`${key} = ?`)
                valoresCategoria.push(value)
            }
        }

        if (camposCategoria.length === 0) return null

        valoresCategoria.push(id)

        const query = `UPDATE categoria SET ${camposCategoria.join(', ')} WHERE id_categoria = ?`

        const [resultado] = await pool.query(query, valoresCategoria)

        return resultado.affectedRows
    }

    async deletarCategoria(id) {
        await pool.query('DELETE FROM categoria WHERE id_categoria = ?', [id])
        return true
    }
}

module.exports = new CategoriaRepository()