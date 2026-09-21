const SaidaRepository = require("../repositories/SaidaRepository");

class SaidaService {
  async listar() {
    return await SaidaRepository.listar();
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de saída inválido.");
      erro.status = 400;
      throw erro;
    }
    return await SaidaRepository.buscarPorId(id);
  }

  async cadastrar(dados) {
    const { id_produto, id_funcionario, quantidade, motivo_saida } = dados;

    if (!id_produto || !id_funcionario) {
      const erro = new Error(
        "Campos 'id_produto' e 'id_funcionario' são obrigatórios.",
      );
      erro.status = 400;
      throw erro;
    }

    if (!quantidade || quantidade <= 0) {
      const erro = new Error("A quantidade deve ser maior que zero.");
      erro.status = 400;
      throw erro;
    }

    // Validação obrigatória pois a coluna é NOT NULL na tabela
    if (!motivo_saida || motivo_saida.trim() === "") {
      const erro = new Error("O campo 'motivo_saida' é obrigatório.");
      erro.status = 400;
      throw erro;
    }

    const produto = await ProdutoRepository.buscarProdutoId(id_produto);
    if (!produto) {
      const erro = new Error("Produto não encontrado");
      erro.status = 400;
      throw erro;
    }

    if (produto.quantidade < quantidade) {
      const erro = new Error(
        `Estoque insuficiente. Disponível: ${produto.quantidade}, solicitados ${quantidade}`,
      );
      erro.status = 400;
      throw erro;
    }

    return await SaidaRepository.cadastrar(dados);
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de saída inválido.");
      erro.status = 400;
      throw erro;
    }

    const { id_produto, id_funcionario, quantidade, motivo_saida } = dados;

    if (!id_produto || !id_funcionario || !quantidade || !motivo_saida) {
      const erro = new Error(
        "Campos 'id_produto', 'id_funcionario', 'quantidade' e 'motivo_saida' são obrigatórios.",
      );
      erro.status = 400;
      throw erro;
    }

    return await SaidaRepository.atualizar(id, dados);
  }

  async deletar(id) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de saída inválido.");
      erro.status = 400;
      throw erro;
    }

    return await SaidaRepository.deletar(id);
  }
}

module.exports = new SaidaService();
