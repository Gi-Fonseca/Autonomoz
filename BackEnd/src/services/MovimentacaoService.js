const MovimentacaoRepository = require("../repositories/MovimentacaoRepository");

class MovimentacaoService {
  async listar() {
    return await MovimentacaoRepository.listar();
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de movimentação inválido.");
      erro.status = 400;
      throw erro;
    }
    return await MovimentacaoRepository.buscarPorId(id);
  }

  async cadastrar(dados) {
    const { id_estoque, id_entrada, id_saida } = dados;

    if (!id_estoque) {
      const erro = new Error("O campo 'id_estoque' é obrigatório.");
      erro.status = 400;
      throw erro;
    }

    if (!id_entrada && !id_saida) {
      const erro = new Error(
        "A movimentação deve ter pelo menos um 'id_entrada' OU 'id_saida'.",
      );
      erro.status = 400;
      throw erro;
    }

    return await MovimentacaoRepository.cadastrar(dados);
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de movimentação inválido.");
      erro.status = 400;
      throw erro;
    }

    const { id_estoque, id_entrada, id_saida } = dados;

    if (!id_estoque || (!id_entrada && !id_saida)) {
      const erro = new Error(
        "Informe 'id_estoque' e pelo menos 'id_entrada' ou 'id_saida'.",
      );
      erro.status = 400;
      throw erro;
    }

    return await MovimentacaoRepository.atualizar(id, dados);
  }

  async deletar(id) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de movimentação inválido.");
      erro.status = 400;
      throw erro;
    }

    return await MovimentacaoRepository.deletar(id);
  }
}

module.exports = new MovimentacaoService();
