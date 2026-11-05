const SaidaRepository = require("../repositories/SaidaRepository");

function validarMotivoSaida(valor) {
  const motivo = typeof valor === "string" ? valor.trim() : "";
  if (!motivo) {
    const erro = new Error("O motivo da saída é obrigatório.");
    erro.status = 400;
    throw erro;
  }
  if (motivo.length > 255) {
    const erro = new Error("O motivo da saída deve ter no máximo 255 caracteres.");
    erro.status = 400;
    throw erro;
  }
  return motivo;
}

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
    const { id_produto, id_funcionario, quantidade } = dados || {};

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

    const motivo_saida = validarMotivoSaida(dados.motivo_saida);
    return SaidaRepository.cadastrar({ ...dados, motivo_saida });
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      const erro = new Error("ID de saída inválido.");
      erro.status = 400;
      throw erro;
    }

    const { id_produto, id_funcionario, quantidade } = dados || {};
    if (!id_produto || !id_funcionario || !quantidade || quantidade <= 0) {
      const erro = new Error(
        "Campos 'id_produto', 'id_funcionario' e 'quantidade' são obrigatórios.",
      );
      erro.status = 400;
      throw erro;
    }

    const motivo_saida = validarMotivoSaida(dados.motivo_saida);
    return SaidaRepository.atualizar(id, { ...dados, motivo_saida });
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
