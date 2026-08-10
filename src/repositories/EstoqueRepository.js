const pool = require("../config/database.js");

class EstoqueRepository {
    async listarEstoque() {
        const [rows] = await pool.query("SELECT * FROM estoque");
        return rows;
    }

    async buscarEstoqueId(id) {
        const [rows] = await pool.query("SELECT * FROM estoque WHERE id_estoque = ?", [id]);
        return rows[0];
    }

    async publicarEstoque(dadosEstoque) {
        const [result] = await pool.query("INSERT INTO estoque SET ?", [dadosEstoque]);
        return result.insertId;
    }

    async alterarDadosId(id, dadosEstoque) {
        const camposEstoque = [];
        const valores = [];

        for (const [key, value] of Object.entries(dadosEstoque)) {
            camposEstoque.push(`${key} = ?`);
            valores.push(value); // Adiciona o valor correspondente
        }

        if (camposEstoque.length === 0) {
            return null;
        }

        valores.push(id);

        const query = `UPDATE estoque SET ${camposEstoque.join(", ")} WHERE id_estoque = ?`;

        const [result] = await pool.query(query, valores);

        return result.affectedRows;
    }

    async deletarEstoque(id) {
        const [result] = await pool.query("DELETE FROM estoque WHERE id_estoque = ?", [id]);
        return result.affectedRows;
    }
}

module.exports = new EstoqueRepository();