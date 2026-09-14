const pool = require('../config/database.js')

class ClienteRepository {
    // Lista clientes
    async listar() {
        const [clientes] = await pool.query('SELECT * FROM cliente')
        return clientes
    }

    // Busca cliente
    async buscarPorId(id) {
        const [clientes] = await pool.query(
            'SELECT * FROM cliente WHERE id_cliente = ?',
            [id]
        )
        return clientes[0]
    }

    // Cria cliente
    async criar(dados) {
        const { nome, email, cadastro } = dados
        const [resultado] = await pool.query(
            'INSERT INTO cliente (nome, email, cadastro) VALUES (?, ?, ?)',
            [nome, email, cadastro || null]
        )
        return resultado.insertId
    }

    // Atualiza cliente
    async atualizar(id, dados) {
        const { nome, email, cadastro } = dados
        const [resultado] = await pool.query(
            'UPDATE cliente SET nome = ?, email = ?, cadastro = ? WHERE id_cliente = ?',
            [nome, email, cadastro || null, id]
        )
        return resultado.affectedRows
    }

    // Exclui cliente
    async excluir(id) {
        const [resultado] = await pool.query(
            'DELETE FROM cliente WHERE id_cliente = ?',
            [id]
        )
        return resultado.affectedRows
    }
}

module.exports = new ClienteRepository()
