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

    // BLINDAGEM: Garantimos que o SQL só use o tipo_produto
async publicarCategoria(dados) {
    const { tipo_produto } = dados;

    if (!tipo_produto || tipo_produto.trim() === '') {
        throw {
            status: 400,
            mensagem: 'O campo tipo_produto é obrigatório'
        };
    }

    const idCriado = await CategoriaRepository.publicarCategoria({
        tipo_produto: tipo_produto.trim()
    });

    // Monte a resposta formatada aqui
    return {
        sucesso: true,
        mensagem: 'Categoria cadastrada com sucesso',
        dados: {
            id_categoria: idCriado,
            tipo_produto: tipo_produto.trim()
        }
    };
}
    async alterarDadosId(id, dadosCategoria) {
        const camposCategoria = []
        const valoresCategoria = []

        for (const [key, value] of Object.entries(dadosCategoria)) {
            // Ignora id_produto se ele estiver vagando pelo objeto
            if (key !== 'id_produto') {
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