const pool = require("../config/database");
const { traduzirErroBanco } = require("../utils/databaseError");
class FuncionarioRepository {
  async findAll() {
    const [rows] = await pool.query(
      "SELECT id,cargo,nome,cpf,email FROM funcionario ORDER BY id DESC",
    );
    return rows;
  }
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id,cargo,nome,cpf,email FROM funcionario WHERE id=?",
      [id],
    );
    return rows[0];
  }
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT id,cargo,nome,cpf,email,senha FROM funcionario WHERE email=?",
      [email],
    );
    return rows[0];
  }
  async findByCpf(cpf) {
    const [rows] = await pool.query(
      "SELECT id,cargo,nome,cpf,email FROM funcionario WHERE cpf=?",
      [cpf],
    );
    return rows[0];
  }
  async create(dados) {
    const [result] = await pool.query(
      "INSERT INTO funcionario (cargo,nome,cpf,email,senha) VALUES (?,?,?,?,?)",
      [dados.cargo, dados.nome, dados.cpf, dados.email, dados.senha],
    );
    return result.insertId;
  }
  async update(id, dados) {
    const permitidos = ["cargo", "nome", "cpf", "email", "senha"];
    const fields = [];
    const values = [];
    for (const campo of permitidos)
      if (dados[campo] !== undefined) {
        fields.push(campo + " = ?");
        values.push(dados[campo]);
      }
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await pool.query(
      "UPDATE funcionario SET " + fields.join(", ") + " WHERE id=?",
      values,
    );
    return result.affectedRows;
  }

  async delete(id) {
    try {
      const [result] = await pool.query("DELETE FROM funcionario WHERE id=?", [
        id,
      ]);
      return result.affectedRows;
    } catch (erro) {
      throw traduzirErroBanco(erro);
    }
  }
}
module.exports = new FuncionarioRepository();
