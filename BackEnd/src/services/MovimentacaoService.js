const MovimentacaoRepository = require("../repositories/MovimentacaoRepository");

function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID de movimentação inválido." };
}

function validarRelacionamento(dados) {
  const quantidade = [dados.id_entrada, dados.id_saida, dados.id_ajuste].filter(Boolean).length;
  if (quantidade !== 1) {
    throw { status: 400, mensagem: "Informe exatamente uma entrada, saída ou ajuste." };
  }
}

class MovimentacaoService {
  async listar() {
    const dados = await MovimentacaoRepository.listar();
    return { sucesso: true, dados, total: dados.length };
  }

  async buscarPorId(id) {
    validarId(id);
    return { sucesso: true, dados: await MovimentacaoRepository.buscarPorId(id) };
  }

  async cadastrar(dados = {}) {
    validarRelacionamento(dados);
    return { sucesso: true, dados: await MovimentacaoRepository.cadastrar(dados) };
  }

  async atualizar(id, dados = {}) {
    validarId(id);
    validarRelacionamento(dados);
    return { sucesso: true, dados: await MovimentacaoRepository.atualizar(id, dados) };
  }

  async deletar(id) {
    validarId(id);
    return { sucesso: true, dados: await MovimentacaoRepository.deletar(id) };
  }
}

module.exports = new MovimentacaoService();
