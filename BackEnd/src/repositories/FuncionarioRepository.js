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
  async count() {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM funcionario",
    );
    return Number(rows[0].total);
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

  async criarCodigoReset(idFuncionario, codigoHash, expiraEm) {
    await pool.query("DELETE FROM redefinicao_senha WHERE id_funcionario=?", [
      idFuncionario,
    ]);
    const [result] = await pool.query(
      "INSERT INTO redefinicao_senha (id_funcionario,codigo_hash,expira_em) VALUES (?,?,?)",
      [idFuncionario, codigoHash, expiraEm],
    );
    return result.insertId;
  }

  async buscarCodigoReset(codigoHash) {
    const [rows] = await pool.query(
      `SELECT r.id, r.id_funcionario, r.expira_em, f.email
       FROM redefinicao_senha r JOIN funcionario f ON f.id = r.id_funcionario
       WHERE r.codigo_hash=? LIMIT 1`,
      [codigoHash],
    );
    return rows[0];
  }

  async excluirCodigoReset(id) {
    await pool.query("DELETE FROM redefinicao_senha WHERE id=?", [id]);
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
