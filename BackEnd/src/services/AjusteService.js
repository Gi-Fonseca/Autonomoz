const AjusteRepository = require("../repositories/AjusteRepository");

function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}

function validarMotivoAjuste(valor) {
  const motivo = typeof valor === "string" ? valor.trim() : "";
  if (!motivo) {
    throw {
      status: 400,
      mensagem: "O motivo do ajuste é obrigatório.",
    };
  }
  if (motivo.length > 255) {
    throw {
      status: 400,
      mensagem: "O motivo do ajuste deve ter no máximo 255 caracteres.",
    };
  }
  return motivo;
}

class AjusteService {
  async listar() {
    return await AjusteRepository.listar();
  }

  async buscarPorId(id) {
    validarId(id);
    const item = await AjusteRepository.buscarPorId(id);
    if (!item) throw { status: 404, mensagem: "Ajuste não encontrado" };
    return item;
  }

  async criar(dados) {
    if (
      !dados ||
      !dados.id_produto ||
      !dados.id_funcionario ||
      !dados.data_ajuste ||
      dados.quantidade === undefined ||
      Number.isNaN(Number(dados.quantidade)) ||
      Number(dados.quantidade) === 0
    ) {
      throw {
        status: 400,
        mensagem:
          "Produto, funcionário, quantidade e data do ajuste são obrigatórios",
      };
    }

    const motivo_ajuste = validarMotivoAjuste(dados.motivo_ajuste);
    const dadosValidados = { ...dados, motivo_ajuste };
    const id = await AjusteRepository.criar(dadosValidados);
    return { id_ajuste: id, ...dadosValidados };
  }

  async atualizar(id, dados) {
    validarId(id);
    await this.buscarPorId(id);

    const motivo_ajuste = validarMotivoAjuste(dados?.motivo_ajuste);
    const dadosValidados = { ...dados, motivo_ajuste };
    const atualizado = await AjusteRepository.atualizar(id, dadosValidados);
    if (!atualizado) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return { id_ajuste: Number(id), alterado: atualizado };
  }
}

module.exports = new AjusteService();
