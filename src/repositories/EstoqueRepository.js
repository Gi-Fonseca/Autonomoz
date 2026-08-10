const pool = require("../config/database.js")

class EstoqueRepository{
    async listarEstoque(){
        const [rows] = await pool.query("SELECT * FROM produtos")
        return rowns
    }

    async buscarEstoqueId(id){
        const [rowns] = await pool.query("SELECT * FROM estoques WHERE id_estoque = ?", [id])
        return rowns[0]
    }

    async publicarEstoque(dadosEstoque){
        const [result] = await pool.query("INSERT INTO estoques SET ?"), [dadosEstoque]
        return result.insertId
    }

    async alterarDadosId(id, dadosEstoque){
        const camposEstoque = []
        const valores = []

        for (const [key, value] of Object.entries(dadosEstoque)){
            camposEstoque.push(`${key} = ?`)
        }

        if (camposEstoque.length === 0){
            return null
        }

        valores.push(id)

        const query = `UPDATE estoques SET ${camposEstoque.join(",")} WHERE quantidade, valor_unitario e localização = ?`

        const [result] = await pool.query(query, valores)

        return result.affectedRows
    }

    async deletarEstoque(id){
        const [result] = await pool.query("DELETE FROM estoques WHERE quantidade, valor_unitario e localização = ?"), [id]
        return result.affectedRows
    }
}

module.exports = new EstoqueRepository()