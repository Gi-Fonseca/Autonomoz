const pool = require("../config/database");
const { traduzirErroBanco } = require("../utils/databaseError");
class FornecedorRepository {
  async listar() {
    const [rows] = await pool.query(
      "SELECT id_fornecedor, nome, cnpj, telefone, email FROM fornecedor",
    );
    return rows;
  }
  async buscarPorId(id) {
    const [rows] = await pool.query(
      "SELECT id_fornecedor, nome, cnpj, telefone, email FROM fornecedor WHERE id_fornecedor = ?",
      [id],
    );
    return rows[0];
  }
  async criar(dados) {
    const [result] = await pool.query(
      "INSERT INTO fornecedor (nome, cnpj, telefone, email) VALUES (?, ?, ?, ?)",
      [dados.nome, dados.cnpj, dados.telefone, dados.email],
    );
    return result.insertId;
  }
  async atualizar(id, dados) {
    const permitidos = ["nome", "cnpj", "telefone", "email"];
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
      "UPDATE fornecedor SET " + campos.join(", ") + " WHERE id_fornecedor = ?",
      valores,
    );
    return result.affectedRows;
  }
  async excluir(id) {
    try {
      const [result] = await pool.query(
        "DELETE FROM fornecedor WHERE id_fornecedor = ?",
        [id],
      );
      return result.affectedRows;
    } catch (erro) {
      throw traduzirErroBanco(erro);
    }
  }
}
module.exports = new FornecedorRepository();
