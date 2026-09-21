const pool = require("../config/database");
class EstoqueRepository {
  async listarEstoque() {
    const [rows] = await pool.query("SELECT * FROM estoque");
    return rows;
  }
  async buscarEstoqueId(id) {
    const [rows] = await pool.query(
      "SELECT * FROM estoque WHERE id_estoque = ?",
      [id],
    );
    return rows[0];
  }
  async publicarEstoque(dados) {
    const [result] = await pool.query(
      "INSERT INTO estoque (id_produto, id_lote, valor_unitario, localizacao) VALUES (?, ?, ?, ?)",
      [
        dados.id_produto,
        dados.id_lote,
        dados.valor_unitario,
        dados.localizacao,
      ],
    );
    return result.insertId;
  }
  async alterarDadosId(id, dados) {
    const permitidos = [
      "id_produto",
      "id_lote",
      "valor_unitario",
      "localizacao",
    ];
    const campos = [];
    const valores = [];
    for (const campo of permitidos)
      if (dados[campo] !== undefined) {
        campos.push(campo + " = ?");
        valores.push(dados[campo]);
      }
    if (!campos.length) return 0;
    valores.push(id);
    const [result] = await pool.query(
      "UPDATE estoque SET " + campos.join(", ") + " WHERE id_estoque = ?",
      valores,
    );
    return result.affectedRows;
  }
  async deletarEstoque(id) {
    const [result] = await pool.query(
      "DELETE FROM estoque WHERE id_estoque = ?",
      [id],
    );
    return result.affectedRows;
  }
}
module.exports = new EstoqueRepository();
