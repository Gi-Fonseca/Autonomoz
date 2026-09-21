const pool = require("../config/database.js");

class AjusteRepository {
  // Lista ajustes
  async listar() {
    const [ajustes] = await pool.query("SELECT * FROM ajuste_produto");
    return ajustes;
  }

  // Busca ajuste
  async buscarPorId(id) {
    const [ajustes] = await pool.query(
      "SELECT * FROM ajuste_produto WHERE id_ajuste = ?",
      [id],
    );
    return ajustes[0];
  }

  // Cria ajuste
  async criar(dados) {
    const { id_produto, id_funcionario, data_ajuste, motivo_ajuste } = dados;
    const [resultado] = await pool.query(
      "INSERT INTO ajuste_produto (id_produto, id_funcionario, data_ajuste, motivo_ajuste) VALUES (?, ?, ?, ?)",
      [id_produto, id_funcionario, data_ajuste, motivo_ajuste],
    );
    return resultado.insertId;
  }

  // Atualiza ajuste
  async atualizar(id, dados) {
    const { id_produto, id_funcionario, data_ajuste, motivo_ajuste } = dados;
    const [resultado] = await pool.query(
      "UPDATE ajuste_produto SET id_produto = ?, id_funcionario = ?, data_ajuste = ?, motivo_ajuste = ? WHERE id_ajuste = ?",
      [id_produto, id_funcionario, data_ajuste, motivo_ajuste, id],
    );
    return resultado.affectedRows;
  }
}

module.exports = new AjusteRepository();
