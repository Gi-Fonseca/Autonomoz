const pool = require("../config/database");

class FuncionarioRepository {

    // Busca todos os funcionários no banco de dados
    async findAll() {
        const [rows] = await pool.query(
            "SELECT id, cargo, nome, cpf, email, data_criacao FROM funcionarios ORDER BY id DESC"
        );
        return rows;
    }

    // Busca um funcionário específico pelo ID
    async findById(id) {
        const [rows] = await pool.query(
            "SELECT id, cargo, nome, cpf, email, data_criacao FROM funcionarios WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    // Busca um funcionário pelo email (usado para verificar unicidade)
    async findByEmail(email) {
        const [rows] = await pool.query(
            "SELECT * FROM funcionarios WHERE email = ?",
            [email]
        );
        return rows[0];
    }

    // Busca um funcionário pelo CPF (usado para verificar unicidade)
    async findByCpf(cpf) {
        const [rows] = await pool.query(
            "SELECT * FROM funcionarios WHERE cpf = ?",
            [cpf]
        );
        return rows[0];
    }

    // Cria um novo funcionário no banco de dados
    async create(dados) {
        const { cargo, nome, cpf, email, senha } = dados;
        const [result] = await pool.query(
            `INSERT INTO funcionarios (cargo, nome, cpf, email, senha) 
             VALUES (?, ?, ?, ?, ?)`,
            [cargo, nome, cpf, email, senha] 
        );
        return result.insertId; 
    }

    // Atualiza os dados de um funcionário existente
    async update(id, dados) {
        const fields = [];
        const values = [];

        // Constrói dinamicamente a query de UPDATE com base nos dados fornecidos
        for (const [key, value] of Object.entries(dados)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return null; // Não há dados para atualizar

        values.push(id);
        const query = `UPDATE funcionarios SET ${fields.join(", ")} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        return result.affectedRows; 
    }

    // Deleta um funcionário pelo ID
    async delete(id) {
        const [result] = await pool.query(
            "DELETE FROM funcionarios WHERE id = ?",
            [id]
        );
        return result.affectedRows; 
    }
}

module.exports = new FuncionarioRepository();
