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

  _validarExatamenteUm(dados) {
    const { id_entrada, id_saida, id_ajuste } = dados;
    const preenchidos = [id_entrada, id_saida, id_ajuste].filter(
      (valor) => valor !== undefined && valor !== null,
    ).length;

    if (preenchidos !== 1) {
      const erro = new Error(
        "A movimentação deve ter apenas um entre 'id_entrada', 'id_saida' ou 'id_ajuste'.",
      );
      erro.status = 400;
      throw erro;
    }
  }

  async cadastrar(dados) {
    this._validarExatamenteUm(dados);
    return await MovimentacaoRepository.cadastrar(dados);
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de movimentação inválido.");
      erro.status = 400;
      throw erro;
    }

    this._validarExatamenteUm(dados)

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
