const pool = require('../config/database.js')

class CategoriaRepository{
    async listarCategoria(){
        const listarCategoria = await pool.query('SELECT * FROM categoria')
        return listarCategoria
    }

    async buscarCategoriaId(id){
        const mostrarCategoria = await pool.query('SELECT * FROM categoria WHERE id = ?', [id])
        return mostrarCategoria[0]
    }

    async publicarCategoria(dadosCategoria){
        const resultadoPublicar = await pool.query('INSERT INTO produto SET ?', [dadosCategoria])
        return resultadoPublicar.insertId
    }

    async alterarDadosId(id, dadosCategoria){
        const camposCategoria = []
        const dadosProduto = []

        for(const [key,value] of Object.entries(dadosCategoria)){
            camposCategoria.push(`${key} = ?`)
            dadosCategoria.push(value)
        }

        if(camposCategoria.length === 0) return null

        dadosCategoria.push(id)

        const query = `UPDATE produto SET ${camposCategoria.join(',')} WHERE id = ?`

        const resultado = await pool.query(query, dadosCategoria)

        return resultado.affectedRows
    }

    async deletarCategoria(id){
        await pool.query('DELETE FROM produto WHERE id = ?', [id])
        return true
    }
}

module.exports = new CategoriaRepository()