const pool = require("../config/database");

class FuncionarioRepository {

    // Lista todos os funcionários
    async findAll() {
        const [rows] = await pool.query(
            "SELECT id, cargo, nome, cpf, email FROM funcionario ORDER BY id DESC"
        );
        return rows;
    }

    // Busca um funcionário pelo ID
    async findById(id) {
        const [rows] = await pool.query(
            "SELECT id, cargo, nome, cpf, email FROM funcionario WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    // Busca um funcionário pelo e-mail
    async findByEmail(email) {
        const [rows] = await pool.query(
            "SELECT * FROM funcionario WHERE email = ?",
            [email]
        );
        return rows[0];
    }

    // Busca um funcionário pelo CPF
    async findByCpf(cpf) {
        const [rows] = await pool.query(
            "SELECT * FROM funcionario WHERE cpf = ?",
            [cpf]
        );
        return rows[0];
    }

    // Cria um funcionário
    async create(dados) {
        const { cargo, nome, cpf, email, senha } = dados;

        const [result] = await pool.query(
            `INSERT INTO funcionario (cargo, nome, cpf, email, senha)
             VALUES (?, ?, ?, ?, ?)`,
            [cargo, nome, cpf, email, senha]
        );

        return result.insertId;
    }

    // Atualiza um funcionário
    async update(id, dados) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(dados)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            return 0;
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE funcionario SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        return result.affectedRows;
    }

    // Exclui um funcionário
    async delete(id) {
        const [result] = await pool.query(
            "DELETE FROM funcionario WHERE id = ?",
            [id]
        );

        return result.affectedRows;
    }
}

module.exports = new FuncionarioRepository();