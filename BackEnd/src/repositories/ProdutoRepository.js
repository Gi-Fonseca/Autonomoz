const pool = require("../config/database");

class ProdutoRepository {
  // Lista produtos
  async listarProdutos(filtros = {}) {
    const values = [];
    const where = [];
    if (filtros.tipo_item) {
      where.push("p.tipo_item = ?");
      values.push(filtros.tipo_item);
    }
    if (filtros.busca) {
      where.push("(p.nome LIKE ? OR p.descricao LIKE ?)");
      values.push(`%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    const limit = Math.min(Math.max(Number(filtros.limit) || 5000, 1), 5000);
    const offset = Math.max(Number(filtros.offset) || 0, 0);
    const [rows] = await pool.query(
      `SELECT p.*, c.tipo_produto, f.nome AS fornecedor_nome FROM produtos p LEFT JOIN categoria c ON c.id_categoria=p.id_categoria LEFT JOIN fornecedor f ON f.id_fornecedor=p.id_fornecedor ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.id_produto DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );
    return rows;
  }
  // Lista produtos com estoque abaixo do mínimo
  async listarAlertas() {
    const [rows] = await pool.query(
      "SELECT p.*, c.tipo_produto, f.nome AS fornecedor_nome FROM produtos p LEFT JOIN categoria c ON c.id_categoria=p.id_categoria LEFT JOIN fornecedor f ON f.id_fornecedor=p.id_fornecedor WHERE p.quantidade <= p.estoque_minimo AND p.status = TRUE ORDER BY p.quantidade ASC, p.nome ASC",
    );
    return rows;
  }
  // Busca produto
  async buscarProdutoId(id) {
    const [rows] = await pool.query(
      "SELECT p.*, c.tipo_produto, f.nome AS fornecedor_nome FROM produtos p LEFT JOIN categoria c ON c.id_categoria=p.id_categoria LEFT JOIN fornecedor f ON f.id_fornecedor=p.id_fornecedor WHERE p.id_produto = ?",
      [id],
    );
    return rows[0];
  }
  // Cria produto
  async publicarProduto(dados) {
    const [resultado] = await pool.query(
      "INSERT INTO produtos (nome, descricao, tipo_item, quantidade, estoque_minimo, validade, id_categoria, id_fornecedor, status, chassi, placa, ano, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        dados.nome,
        dados.descricao,
        dados.tipo_item,
        dados.quantidade,
        dados.estoque_minimo,
        dados.validade,
        dados.id_categoria,
        dados.id_fornecedor,
        dados.status,
        dados.chassi,
        dados.placa,
        dados.ano,
        dados.foto || null,
      ],
    );
    return resultado.insertId;
  }
  // Atualiza produto
  async alterarDados(id, dados) {
    const permitidos = [
      "nome",
      "descricao",
      "tipo_item",
      "quantidade",
      "estoque_minimo",
      "validade",
      "id_categoria",
      "id_fornecedor",
      "status",
      "chassi",
      "placa",
      "ano",
      "foto",
    ];
    const campos = [],
      valores = [];
    // Filtra campos permitidos
    for (const campo of permitidos)
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(dados[campo]);
      }
    if (!campos.length) return 0;
    valores.push(id);
    const [resultado] = await pool.query(
      `UPDATE produtos SET ${campos.join(", ")} WHERE id_produto = ?`,
      valores,
    );
    return resultado.affectedRows;
  }
}
module.exports = new ProdutoRepository();
