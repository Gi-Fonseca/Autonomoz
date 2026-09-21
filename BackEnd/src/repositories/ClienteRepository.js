const pool = require("../config/database");
class ClienteRepository {
  async listar() {
    const [rows] = await pool.query(
      "SELECT id_cliente, nome, email, cadastro FROM cliente",
    );
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      "SELECT id_cliente, nome, email, cadastro FROM cliente WHERE id_cliente = ?",
      [id],
    );
    return rows[0];
  }
  async criar(dados) {
    const [result] = await pool.query(
      "INSERT INTO cliente (nome, email, cadastro) VALUES (?, ?, ?)",
      [dados.nome, dados.email, dados.cadastro || null],
    );
    return result.insertId;
  }
  async atualizar(id, dados) {
    const permitidos = ["nome", "email", "cadastro"];
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
      "UPDATE cliente SET " + campos.join(", ") + " WHERE id_cliente = ?",
      valores,
    );
    return result.affectedRows;
  }
  async excluir(id) {
    const [result] = await pool.query(
      "DELETE FROM cliente WHERE id_cliente = ?",
      [id],
    );
    return result.affectedRows;
  }
}
module.exports = new ClienteRepository();
