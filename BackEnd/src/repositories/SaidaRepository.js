const db = require("../config/database");

class SaidaRepository {
  async listar() {
    const query = `
            SELECT s.*, p.nome AS produto_nome, f.nome AS funcionario_nome 
            FROM saida_produto s
            LEFT JOIN produtos p ON s.id_produto = p.id_produto
            LEFT JOIN funcionario f ON s.id_funcionario = f.id
            ORDER BY s.id_saida DESC
        `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async buscarPorId(id) {
    const query = `
            SELECT s.*, p.nome AS produto_nome, f.nome AS funcionario_nome 
            FROM saida_produto s
            LEFT JOIN produtos p ON s.id_produto = p.id_produto
            LEFT JOIN funcionario f ON s.id_funcionario = f.id
            WHERE s.id_saida = ?
        `;
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      const erro = new Error("Registro de saída não encontrado.");
      erro.status = 404;
      throw erro;
    }

    return rows[0];
  }

  async cadastrar(dados) {
    const {
      id_produto,
      id_funcionario,
      quantidade,
      motivo_saida,
      valor_venda,
      nf,
    } = dados;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Cadastra a saída na tabela
      const querySaida = `
                INSERT INTO saida_produto (id_produto, id_funcionario, quantidade, motivo_saida, valor_venda, nf)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
      const [resSaida] = await connection.execute(querySaida, [
        id_produto,
        id_funcionario,
        quantidade,
        motivo_saida,
        valor_venda || null,
        nf || null,
      ]);

      // 2. Subtrai a quantidade do estoque do produto
      const queryEstoque = `
                UPDATE produtos 
                SET quantidade = quantidade - ? 
                WHERE id_produto = ?
            `;
      await connection.execute(queryEstoque, [quantidade, id_produto]);

      await connection.commit();

      return { id_saida: resSaida.insertId, ...dados };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async atualizar(id_saida, dados) {
    const {
      id_produto,
      id_funcionario,
      quantidade,
      motivo_saida,
      valor_venda,
      nf,
    } = dados;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Busca a quantidade antiga para ajustar o estoque com a diferença
      const [saidas] = await connection.execute(
        "SELECT id_produto, quantidade FROM saida_produto WHERE id_saida = ?",
        [id_saida],
      );

      if (saidas.length === 0) {
        const erro = new Error("Registro de saída não encontrado.");
        erro.status = 404;
        throw erro;
      }

      const quantidadeAntiga = saidas[0].quantidade;
      const diferenca = quantidade - quantidadeAntiga;

      // Atualiza o registro da saída
      const queryUpdate = `
                UPDATE saida_produto 
                SET id_produto = ?, id_funcionario = ?, quantidade = ?, motivo_saida = ?, valor_venda = ?, nf = ?
                WHERE id_saida = ?
            `;
      await connection.execute(queryUpdate, [
        id_produto,
        id_funcionario,
        quantidade,
        motivo_saida,
        valor_venda || null,
        nf || null,
        id_saida,
      ]);

      // Atualiza o estoque no produto
      const queryEstoque = `
                UPDATE produtos 
                SET quantidade = quantidade - ? 
                WHERE id_produto = ?
            `;
      await connection.execute(queryEstoque, [diferenca, id_produto]);

      await connection.commit();
      return { id_saida: Number(id_saida), ...dados };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deletar(id_saida) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Limpa vínculos da tabela de movimentacao caso existam
      await connection.execute("DELETE FROM movimentacao WHERE id_saida = ?", [
        id_saida,
      ]);

      // 2. Deleta o registro da saída
      const [resultado] = await connection.execute(
        "DELETE FROM saida_produto WHERE id_saida = ?",
        [id_saida],
      );

      if (resultado.affectedRows === 0) {
        const erro = new Error(
          "Registro de saída não encontrado para exclusão.",
        );
        erro.status = 404;
        throw erro;
      }

      await connection.commit();
      return { id_saida: Number(id_saida) };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new SaidaRepository();
