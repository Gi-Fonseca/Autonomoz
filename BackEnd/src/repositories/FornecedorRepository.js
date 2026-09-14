const pool = require('../config/database.js')

class FornecedorRepository {
    // Lista fornecedores
    async listar() {
        const [fornecedores] = await pool.query('SELECT * FROM fornecedor')
        return fornecedores
    }

    // Busca fornecedor
    async buscarPorId(id) {
        const [fornecedores] = await pool.query(
            'SELECT * FROM fornecedor WHERE id_fornecedor = ?',
            [id]
        )
        return fornecedores[0]
    }

    // Cria fornecedor
    async criar(dados) {
        const { nome, cnpj, telefone, email } = dados
        const [resultado] = await pool.query(
            'INSERT INTO fornecedor (nome, cnpj, telefone, email) VALUES (?, ?, ?, ?)',
            [nome, cnpj, telefone, email]
        )
        return resultado.insertId
    }

    // Atualiza fornecedor
    async atualizar(id, dados) {
        const { nome, cnpj, telefone, email } = dados
        const [resultado] = await pool.query(
            'UPDATE fornecedor SET nome = ?, cnpj = ?, telefone = ?, email = ? WHERE id_fornecedor = ?',
            [nome, cnpj, telefone, email, id]
        )
        return resultado.affectedRows
    }

    // Exclui fornecedor
    async excluir(id) {
        const [resultado] = await pool.query(
            'DELETE FROM fornecedor WHERE id_fornecedor = ?',
            [id]
        )
        return resultado.affectedRows
    }
}

module.exports = new FornecedorRepository()
