const pool = require("../config/database")

class ProdutoRepository {
    // Lista produtos
    async listarProdutos() {
        const [rows] = await pool.query(
            "SELECT * FROM produtos WHERE status = 1"
        )

        return rows
    }

    // Busca produto
    async buscarProdutoId(id) {
        const [rows] = await pool.query(
            "SELECT * FROM produtos WHERE id_produto = ?",
            [id]
        )

        return rows[0]
    }

    // Cria produto
    async publicarProduto(dadosProduto) {
        const {
            nome,
            quantidade,
            validade,
            id_categoria,
            id_fornecedor,
            status
        } = dadosProduto

        const [resultado] = await pool.query(
            `INSERT INTO produtos
            (
                nome,
                quantidade,
                validade,
                id_categoria,
                id_fornecedor,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nome,
                quantidade,
                validade,
                id_categoria,
                id_fornecedor,
                status
            ]
        )

        return resultado.insertId
    }

    // Atualiza produto
    async alterarDados(id, dadosProduto) {
        const camposPermitidos = [
            "nome",
            "quantidade",
            "validade",
            "id_categoria",
            "id_fornecedor",
            "status"
        ]

        const campos = []
        const valores = []

        // Filtra campos
        for (const campo of camposPermitidos) {
            if (dadosProduto[campo] !== undefined) {
                campos.push(`${campo} = ?`)
                valores.push(dadosProduto[campo])
            }
        }

        if (campos.length === 0) {
            return 0
        }

        valores.push(id)

        const [resultado] = await pool.query(
            `UPDATE produtos
             SET ${campos.join(", ")}
             WHERE id_produto = ?`,
            valores
        )

        return resultado.affectedRows
    }

    async desativarProduto(id){
        const [resultado] = await pool.query(
            `UPDATE produtos SET status = 0 WHERE id_produto = ?`,
            [id]
        )
        return resultado.affectedRows
    }
}

module.exports = new ProdutoRepository()
