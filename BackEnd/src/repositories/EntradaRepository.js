const db = require("../config/database");

function erroHttp(mensagem, status) {
  return Object.assign(new Error(mensagem), { status });
}

class EntradaRepository {
  async cadastrar(dados) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO entrada_produto
         (id_produto, id_funcionario, quantidade, data_entrada, valor_compra, nf, fornecedor, motivo_entrada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dados.id_produto,
          dados.id_funcionario,
          dados.quantidade,
          dados.data_entrada,
          dados.valor_compra,
          dados.nf || null,
          dados.fornecedor || null,
          dados.motivo_entrada,
        ],
      );
      const [estoque] = await connection.execute(
        "UPDATE produtos SET quantidade = quantidade + ? WHERE id_produto = ?",
        [dados.quantidade, dados.id_produto],
      );
      if (!estoque.affectedRows) {
        throw erroHttp("Produto não encontrado para registrar a entrada.", 404);
      }
      await connection.execute(
        "INSERT INTO movimentacao (id_entrada) VALUES (?)",
        [result.insertId],
      );
      await connection.commit();
      return { id_entrada: result.insertId, ...dados };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listar() {
    const [rows] = await db.execute(
      `SELECT e.*, p.nome AS produto_nome, f.nome AS funcionario_nome
       FROM entrada_produto e
       LEFT JOIN produtos p ON e.id_produto = p.id_produto
       LEFT JOIN funcionario f ON e.id_funcionario = f.id
       ORDER BY e.id_entrada DESC`,
    );
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await db.execute(
      `SELECT e.*, p.nome AS produto_nome, f.nome AS funcionario_nome
       FROM entrada_produto e
       LEFT JOIN produtos p ON e.id_produto = p.id_produto
       LEFT JOIN funcionario f ON e.id_funcionario = f.id
       WHERE e.id_entrada = ?`,
      [id],
    );
    if (!rows.length) throw erroHttp("Registro de entrada não encontrado.", 404);
    return rows[0];
  }

  async atualizar(id, dados) {
    const permitidos = [
      "id_produto",
      "quantidade",
      "data_entrada",
      "valor_compra",
      "nf",
      "fornecedor",
      "motivo_entrada",
    ];
    const chaves = permitidos.filter((chave) => dados[chave] !== undefined);
    if (!chaves.length) throw erroHttp("Nenhum campo válido informado.", 400);

    const [result] = await db.execute(
      `UPDATE entrada_produto SET ${chaves.map((chave) => `${chave} = ?`).join(", ")} WHERE id_entrada = ?`,
      [...chaves.map((chave) => dados[chave]), id],
    );
    if (!result.affectedRows) throw erroHttp("Registro de entrada não encontrado.", 404);
    return { id_entrada: Number(id), ...dados };
  }
}

module.exports = new EntradaRepository();
