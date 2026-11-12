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
      "INSERT INTO produtos (nome, descricao, tipo_item, quantidade, estoque_minimo, validade, id_categoria, id_fornecedor, status, chassi, placa, ano, foto, preco_custo, preco_venda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        dados.preco_custo,
        dados.preco_venda,
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
      "preco_custo",
      "preco_venda",
    ];
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [produtos] = await connection.query(
        "SELECT quantidade, id_categoria FROM produtos WHERE id_produto = ? FOR UPDATE",
        [id],
      );
      if (!produtos.length) throw Object.assign(new Error("Produto não encontrado."), { status: 404 });

      const dadosAtualizados = { ...dados };
      if (dadosAtualizados.id_categoria !== undefined) {
        const idCategoriaSolicitado = Number(dadosAtualizados.id_categoria);
        if (Number.isInteger(idCategoriaSolicitado) && idCategoriaSolicitado > 0) {
          const [categorias] = await connection.query(
            "SELECT id_categoria FROM categoria WHERE id_categoria = ? LIMIT 1",
            [idCategoriaSolicitado],
          );
          if (categorias.length) {
            dadosAtualizados.id_categoria = idCategoriaSolicitado;
          } else {
            dadosAtualizados.id_categoria = produtos[0].id_categoria ?? null;
          }
        } else {
          // NULL é permitido pelo vínculo e preserva a categoria original
          // quando o formulário não conseguiu resolver o ID selecionado.
          dadosAtualizados.id_categoria = produtos[0].id_categoria ?? null;
        }
      }

      const campos = [];
      const valores = [];
      for (const campo of permitidos) {
        if (dadosAtualizados[campo] !== undefined) {
          campos.push(`${campo} = ?`);
          valores.push(dadosAtualizados[campo]);
        }
      }
      if (campos.length) {
        valores.push(id);
        await connection.query(
          `UPDATE produtos SET ${campos.join(", ")} WHERE id_produto = ?`,
          valores,
        );
      }

      const quantidadeAntes = Number(produtos[0].quantidade || 0);
      const quantidadeDepois = dados.quantidade === undefined
        ? quantidadeAntes
        : Number(dados.quantidade);
      const delta = quantidadeDepois - quantidadeAntes;
      const [ajuste] = await connection.query(
        `INSERT INTO ajuste_produto
         (id_produto, id_funcionario, quantidade, data_ajuste, motivo_ajuste, foto)
         VALUES (?, ?, ?, NOW(), ?, NULL)`,
        [id, dados.id_funcionario, delta, dados.motivo_ajuste],
      );
      await connection.query("INSERT INTO movimentacao (id_ajuste) VALUES (?)", [ajuste.insertId]);
      await connection.commit();
      return { affectedRows: 1, id_ajuste: ajuste.insertId, quantidade_delta: delta };
    } catch (erro) {
      await connection.rollback();
      throw erro;
    } finally {
      connection.release();
    }
  }
}
module.exports = new ProdutoRepository();
