const pool = require("../config/database");

class RelatorioRepository {
  async estoque() {
    const [itens] = await pool.query(`
      SELECT p.id_produto, p.nome, p.descricao, p.tipo_item,
             p.quantidade, p.estoque_minimo, p.validade, p.status,
             c.tipo_produto AS categoria, f.nome AS fornecedor_nome
      FROM produtos p
      LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN fornecedor f ON f.id_fornecedor = p.id_fornecedor
      ORDER BY p.nome ASC
    `);

    const [resumo] = await pool.query(`
      SELECT COUNT(*) AS total_itens,
             COALESCE(SUM(quantidade), 0) AS total_unidades,
             COALESCE(SUM(CASE WHEN quantidade <= estoque_minimo THEN 1 ELSE 0 END), 0) AS total_alertas,
             COALESCE(SUM(CASE WHEN tipo_item = 'VEICULO' THEN 1 ELSE 0 END), 0) AS total_veiculos,
             COALESCE(SUM(CASE WHEN tipo_item = 'PECA' THEN 1 ELSE 0 END), 0) AS total_pecas
      FROM produtos
      WHERE status = TRUE
    `);

    return { resumo: resumo[0], itens };
  }
}

module.exports = new RelatorioRepository();
