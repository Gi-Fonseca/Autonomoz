const db = require("../config/database");

class EntradaRepository {
  async cadastrar(dados) {
    const {
      id_produto,
      id_funcionario,
      quantidade,
      data_entrada,
      valor_compra,
      nf,
      fornecedor,
    } = dados;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO entrada_produto
                 (id_produto, id_funcionario, quantidade, data_entrada, valor_compra, nf, fornecedor)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id_produto,
          id_funcionario,
          quantidade,
          data_entrada,
          valor_compra,
          nf || null,
          fornecedor,
        ],
      );
      await connection.execute(
        "UPDATE produtos SET quantidade = quantidade + ? WHERE id_produto = ?",
        [quantidade, id_produto],
      );
      await connection.execute(
        "INSERT INTO movimentacao (id_entrada) VALUES (?)",
        [result.insertId],
      );
      await connection.commit();
      return { id_entrada: result.insertId, ...dados };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async listar() {
    const [rows] = await db.execute(
      `SELECT e.*, p.nome produto_nome, f.nome funcionario_nome FROM entrada_produto e LEFT JOIN produtos p ON e.id_produto=p.id_produto LEFT JOIN funcionario f ON e.id_funcionario=f.id ORDER BY e.id_entrada DESC`,
    );
    return rows;
  }
  async buscarPorId(id) {
    const [rows] = await db.execute(
      `SELECT e.*, p.nome produto_nome, f.nome funcionario_nome FROM entrada_produto e LEFT JOIN produtos p ON e.id_produto=p.id_produto LEFT JOIN funcionario f ON e.id_funcionario=f.id WHERE e.id_entrada=?`,
      [id],
    );
    if (!rows.length)
      throw Object.assign(new Error("Registro de entrada não encontrado."), {
        status: 404,
      });
    return rows[0];
  }
  async atualizar(id, dados) {
    const allowed = [
      "id_produto",
      "id_funcionario",
      "quantidade",
      "data_entrada",
      "valor_compra",
      "nf",
      "fornecedor",
    ];
    const keys = allowed.filter((key) => dados[key] !== undefined);
    if (!keys.length)
      throw Object.assign(new Error("Nenhum campo válido informado."), {
        status: 400,
      });

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Busca id_produto e quantidade atuais para ajustar o estoque pela diferença
      const [entradas] = await connection.execute(
        "SELECT id_produto, quantidade FROM entrada_produto WHERE id_entrada = ?",
        [id],
      );
      if (!entradas.length)
        throw Object.assign(new Error("Registro de entrada não encontrado."), {
          status: 404,
        });

      const entradaAtual = entradas[0];
      const idProdutoFinal =
        dados.id_produto !== undefined
          ? dados.id_produto
          : entradaAtual.id_produto;
      const quantidadeFinal =
        dados.quantidade !== undefined
          ? dados.quantidade
          : entradaAtual.quantidade;

      if (
        dados.id_produto !== undefined &&
        Number(dados.id_produto) !== Number( entradaAtual.id_produto)
      ) {
        throw Object.assign(
          new Error(
            "Alterar o produto de uma entrada existente não é suportado.",
          ),
          { status: 400 },
        );
      }

      const diferenca = quantidadeFinal - entradaAtual.quantidade;

      const [result] = await connection.execute(
        `UPDATE entrada_produto SET ${keys.map((key) => `${key}=?`).join(",")} WHERE id_entrada=?`,
        [...keys.map((key) => dados[key]), id],
      );
      if (!result.affectedRows)
        throw Object.assign(new Error("Registro de entrada não encontrado."), {
          status: 404,
        });

      if (diferenca !== 0) {
        await connection.execute(
          "UPDATE produtos SET quantidade = quantidade + ? WHERE id_produto = ?",
          [diferenca, idProdutoFinal],
        );
      }

      await connection.commit();
      return { id_entrada: Number(id), ...dados };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
module.exports = new EntradaRepository();
