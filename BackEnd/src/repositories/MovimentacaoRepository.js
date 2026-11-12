const db = require("../config/database");

class MovimentacaoRepository {
  // Lista o histórico consolidado de entradas, saídas e ajustes.
  async listar(limite = 500) {
    const query = `
      SELECT * FROM (
        SELECT e.id_entrada AS referencia_id, e.data_entrada AS data_movimentacao,
               'ENTRADA' AS tipo, e.quantidade, p.nome AS produto_nome,
               f.nome AS funcionario_nome,
               COALESCE(NULLIF(TRIM(e.motivo_entrada), ''), 'Não informado') AS motivo
        FROM entrada_produto e
        LEFT JOIN produtos p ON p.id_produto = e.id_produto
        LEFT JOIN funcionario f ON f.id = e.id_funcionario
        UNION ALL
        SELECT s.id_saida, s.data_saida, 'SAIDA', s.quantidade, p.nome,
               f.nome, s.motivo_saida
        FROM saida_produto s
        LEFT JOIN produtos p ON p.id_produto = s.id_produto
        LEFT JOIN funcionario f ON f.id = s.id_funcionario
        UNION ALL
        SELECT a.id_ajuste, a.data_ajuste, 'AJUSTE', a.quantidade, p.nome,
               f.nome, a.motivo_ajuste
        FROM ajuste_produto a
        LEFT JOIN produtos p ON p.id_produto = a.id_produto
        LEFT JOIN funcionario f ON f.id = a.id_funcionario
      ) historico
      ORDER BY data_movimentacao DESC, referencia_id DESC
      ${Number.isInteger(limite) && limite > 0 ? `LIMIT ${limite}` : ""}
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await db.execute(
      "SELECT id_movimentacao, id_saida, id_entrada, id_ajuste FROM movimentacao WHERE id_movimentacao = ?",
      [id],
    );
    if (!rows.length) {
      throw Object.assign(new Error("Registro de movimentação não encontrado."), {
        status: 404,
      });
    }
    return rows[0];
  }

  async cadastrar(dados) {
    const [resultado] = await db.execute(
      "INSERT INTO movimentacao (id_saida, id_entrada, id_ajuste) VALUES (?, ?, ?)",
      [dados.id_saida || null, dados.id_entrada || null, dados.id_ajuste || null],
    );
    return { id_movimentacao: resultado.insertId, ...dados };
  }

  async atualizar(id, dados) {
    const [resultado] = await db.execute(
      "UPDATE movimentacao SET id_saida = ?, id_entrada = ?, id_ajuste = ? WHERE id_movimentacao = ?",
      [dados.id_saida || null, dados.id_entrada || null, dados.id_ajuste || null, id],
    );
    if (!resultado.affectedRows) {
      throw Object.assign(
        new Error("Registro de movimentação não encontrado para atualização."),
        { status: 404 },
      );
    }
    return { id_movimentacao: Number(id), ...dados };
  }

  async deletar(id) {
    const [resultado] = await db.execute(
      "DELETE FROM movimentacao WHERE id_movimentacao = ?",
      [id],
    );
    if (!resultado.affectedRows) {
      throw Object.assign(
        new Error("Registro de movimentação não encontrado para exclusão."),
        { status: 404 },
      );
    }
    return { id_movimentacao: Number(id) };
  }
}

module.exports = new MovimentacaoRepository();
