const pool = require("../config/database");
const MovimentacaoRepository = require("./MovimentacaoRepository");

function totalizarQuantidade(itens) {
  return itens.reduce((total, item) => total + Number(item.quantidade || 0), 0);
}

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
             COALESCE(SUM(CASE WHEN tipo_item = 'PECA' AND quantidade < 3 THEN 1 ELSE 0 END), 0) AS total_alertas,
             COALESCE(SUM(CASE WHEN tipo_item = 'VEICULO' THEN 1 ELSE 0 END), 0) AS total_veiculos,
             COALESCE(SUM(CASE WHEN tipo_item = 'PECA' THEN 1 ELSE 0 END), 0) AS total_pecas
      FROM produtos
      WHERE status = TRUE
    `);

    return { resumo: resumo[0], itens };
  }

  async entradas() {
    const [itens] = await pool.query(`
      SELECT e.id_entrada AS id,
             e.data_entrada AS data_movimentacao,
             p.nome AS produto_nome,
             e.quantidade,
             e.fornecedor,
             e.nf,
             e.valor_compra,
             f.nome AS funcionario_nome,
             COALESCE(NULLIF(e.motivo_entrada, ''), CONCAT('NF: ', COALESCE(e.nf, '-'))) AS motivo
      FROM entrada_produto e
      LEFT JOIN produtos p ON p.id_produto = e.id_produto
      LEFT JOIN funcionario f ON f.id = e.id_funcionario
      ORDER BY e.data_entrada DESC, e.id_entrada DESC
    `);
    return {
      resumo: {
        total_registros: itens.length,
        total_unidades: totalizarQuantidade(itens),
      },
      itens,
    };
  }

  async saidas() {
    const [itens] = await pool.query(`
      SELECT s.id_saida AS id,
             s.data_saida AS data_movimentacao,
             p.nome AS produto_nome,
             s.quantidade,
             s.id_cliente,
             s.valor_venda,
             s.nf,
             f.nome AS funcionario_nome,
             s.motivo_saida AS motivo
      FROM saida_produto s
      LEFT JOIN produtos p ON p.id_produto = s.id_produto
      LEFT JOIN funcionario f ON f.id = s.id_funcionario
      ORDER BY s.data_saida DESC, s.id_saida DESC
    `);
    return {
      resumo: {
        total_registros: itens.length,
        total_unidades: totalizarQuantidade(itens),
      },
      itens,
    };
  }

  async movimentacoes() {
    const itens = await MovimentacaoRepository.listar(null);
    const contar = (tipo) =>
      itens.filter(
        (item) => String(item.tipo || "").toUpperCase() === tipo,
      ).length;
    return {
      resumo: {
        total_registros: itens.length,
        total_entradas: contar("ENTRADA"),
        total_saidas: contar("SAIDA"),
        total_ajustes: contar("AJUSTE"),
      },
      itens,
    };
  }
}

module.exports = new RelatorioRepository();
