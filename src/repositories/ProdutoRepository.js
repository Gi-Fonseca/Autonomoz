const pool = require("../config/database");

class ProdutoRepository {

    async listarProdutos() {
        const [rows] = await pool.query("SELECT * FROM produtos");
        return rows;
    }

    async buscarProdutoId(id) {
        const [rows] = await pool.query(
            "SELECT * FROM produtos WHERE id_produto = ?",
            [id]
        );
        return rows[0];
    }

    async publicarProduto(dadosProduto) {
        const [result] = await pool.query(
            "INSERT INTO produtos SET ?",
            [dadosProduto]
        );
        return result.insertId;
    }

    async alterarDados(id, dadosProduto) {

        const camposProduto = [];
        const valores = [];

        for (const [key, value] of Object.entries(dadosProduto)) {
            camposProduto.push(`${key} = ?`);
            valores.push(value);
        }

        if (camposProduto.length === 0) {
            return null;
        }

        valores.push(id);

        const query = `
            UPDATE produtos 
            SET ${camposProduto.join(", ")} 
            WHERE id_produto = ?
        `;

        const [result] = await pool.query(query, valores);

        return result.affectedRows;
    }

    async deletarProduto(id) {
        const [result] = await pool.query(
            "DELETE FROM produtos WHERE id_produto = ?",
            [id]
        );

        return result.affectedRows;
    }
}

module.exports = new ProdutoRepository();