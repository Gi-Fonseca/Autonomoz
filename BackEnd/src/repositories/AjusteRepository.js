const pool = require("../config/database.js");

function erroHttp(mensagem, status) {
  return Object.assign(new Error(mensagem), { status });
}

class AjusteRepository {
  async listar() {
    const [ajustes] = await pool.query(
      `SELECT a.*, p.nome AS produto_nome, f.nome AS funcionario_nome
       FROM ajuste_produto a
       LEFT JOIN produtos p ON p.id_produto = a.id_produto
       LEFT JOIN funcionario f ON f.id = a.id_funcionario
       ORDER BY a.data_ajuste DESC, a.id_ajuste DESC`,
    );
    return ajustes;
  }

  async buscarPorId(id) {
    const [ajustes] = await pool.query(
      `SELECT a.*, p.nome AS produto_nome, f.nome AS funcionario_nome
       FROM ajuste_produto a
       LEFT JOIN produtos p ON p.id_produto = a.id_produto
       LEFT JOIN funcionario f ON f.id = a.id_funcionario
       WHERE a.id_ajuste = ?`,
      [id],
    );
    return ajustes[0];
  }

  async criar(dados) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [estoque] = await connection.query(
        "UPDATE produtos SET quantidade = quantidade + ? WHERE id_produto = ? AND quantidade + ? >= 0",
        [dados.quantidade, dados.id_produto, dados.quantidade],
      );
      if (!estoque.affectedRows) {
        const [produto] = await connection.query(
          "SELECT id_produto FROM produtos WHERE id_produto = ?",
          [dados.id_produto],
        );
        throw erroHttp(
          produto.length
            ? "O ajuste deixaria o estoque abaixo de zero."
            : "Produto não encontrado.",
          produto.length ? 409 : 404,
        );
      }

      const [resultado] = await connection.query(
        `INSERT INTO ajuste_produto
         (id_produto, id_funcionario, quantidade, data_ajuste, motivo_ajuste, foto)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          dados.id_produto,
          dados.id_funcionario,
          dados.quantidade,
          dados.data_ajuste,
          dados.motivo_ajuste,
          dados.foto || null,
        ],
      );
      await connection.query(
        "INSERT INTO movimentacao (id_ajuste) VALUES (?)",
        [resultado.insertId],
      );
      await connection.commit();
      return { id_ajuste: resultado.insertId, ...dados };
    } catch (erro) {
      await connection.rollback();
      throw erro;
    } finally {
      connection.release();
    }
  }

  async atualizar(id, dados) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [ajustes] = await connection.query(
        "SELECT * FROM ajuste_produto WHERE id_ajuste = ? FOR UPDATE",
        [id],
      );
      const atual = ajustes[0];
      if (!atual) throw erroHttp("Ajuste não encontrado.", 404);

      const produtoAntigoId = Number(atual.id_produto);
      const produtoNovoId = Number(dados.id_produto);
      const quantidadeAntiga = Number(atual.quantidade);
      const quantidadeNova = Number(dados.quantidade);
      const idsProdutos = [...new Set([produtoAntigoId, produtoNovoId])].sort(
        (a, b) => a - b,
      );
      const placeholders = idsProdutos.map(() => "?").join(", ");
      const [produtos] = await connection.query(
        `SELECT id_produto, quantidade FROM produtos
         WHERE id_produto IN (${placeholders})
         ORDER BY id_produto FOR UPDATE`,
        idsProdutos,
      );
      const porId = new Map(
        produtos.map((produto) => [Number(produto.id_produto), Number(produto.quantidade)]),
      );
      if (idsProdutos.some((produtoId) => !porId.has(produtoId))) {
        throw erroHttp("Um dos produtos selecionados não foi encontrado.", 404);
      }

      if (produtoAntigoId === produtoNovoId) {
        const novoSaldo = porId.get(produtoAntigoId) - quantidadeAntiga + quantidadeNova;
        if (novoSaldo < 0) {
          throw erroHttp("A edição deixaria o estoque abaixo de zero.", 409);
        }
        await connection.query(
          "UPDATE produtos SET quantidade = ? WHERE id_produto = ?",
          [novoSaldo, produtoAntigoId],
        );
      } else {
        const saldoAntigo = porId.get(produtoAntigoId) - quantidadeAntiga;
        const saldoNovo = porId.get(produtoNovoId) + quantidadeNova;
        if (saldoAntigo < 0 || saldoNovo < 0) {
          throw erroHttp("A edição deixaria um dos estoques abaixo de zero.", 409);
        }
        await connection.query(
          "UPDATE produtos SET quantidade = ? WHERE id_produto = ?",
          [saldoAntigo, produtoAntigoId],
        );
        await connection.query(
          "UPDATE produtos SET quantidade = ? WHERE id_produto = ?",
          [saldoNovo, produtoNovoId],
        );
      }

      await connection.query(
        `UPDATE ajuste_produto
         SET id_produto = ?, id_funcionario = ?, quantidade = ?, data_ajuste = ?, motivo_ajuste = ?, foto = ?
         WHERE id_ajuste = ?`,
        [
          produtoNovoId,
          dados.id_funcionario,
          quantidadeNova,
          dados.data_ajuste,
          dados.motivo_ajuste,
          dados.foto || null,
          id,
        ],
      );
      await connection.commit();
      return { id_ajuste: Number(id), ...dados };
    } catch (erro) {
      await connection.rollback();
      throw erro;
    } finally {
      connection.release();
    }
  }
}

module.exports = new AjusteRepository();
