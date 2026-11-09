const AjusteRepository = require("../repositories/AjusteRepository");

function validarId(id) {
  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw { status: 400, mensagem: "ID inválido" };
  }
}

function validarMotivoAjuste(valor) {
  const motivo = typeof valor === "string" ? valor.trim() : "";
  if (!motivo) {
    throw { status: 400, mensagem: "O motivo do ajuste é obrigatório." };
  }
  if (motivo.length > 255) {
    throw {
      status: 400,
      mensagem: "O motivo do ajuste deve ter no máximo 255 caracteres.",
    };
  }
  return motivo;
}

function validarDadosAjuste(dados) {
  const id_produto = Number(dados.id_produto);
  const id_funcionario = Number(dados.id_funcionario);
  const quantidade = Number(dados.quantidade);
  const data_ajuste = dados.data_ajuste;

  if (!Number.isInteger(id_produto) || id_produto <= 0) {
    throw { status: 400, mensagem: "Selecione um produto válido." };
  }
  if (!Number.isInteger(id_funcionario) || id_funcionario <= 0) {
    throw { status: 400, mensagem: "O responsável pelo ajuste é obrigatório." };
  }
  if (!Number.isInteger(quantidade) || quantidade === 0) {
    throw {
      status: 400,
      mensagem: "A quantidade do ajuste deve ser um inteiro diferente de zero.",
    };
  }
  if (!data_ajuste || Number.isNaN(new Date(data_ajuste).getTime())) {
    throw { status: 400, mensagem: "Informe uma data válida para o ajuste." };
  }

  return {
    ...dados,
    id_produto,
    id_funcionario,
    quantidade,
    data_ajuste,
    motivo_ajuste: validarMotivoAjuste(dados.motivo_ajuste),
    foto: dados.foto || null,
  };
}

class AjusteService {
  async listar() {
    const dados = await AjusteRepository.listar();
    return { sucesso: true, dados, total: dados.length };
  }

  async buscarPorId(id) {
    validarId(id);
    const item = await AjusteRepository.buscarPorId(id);
    if (!item) throw { status: 404, mensagem: "Ajuste não encontrado" };
    return { sucesso: true, dados: item };
  }

  async criar(dados) {
    const dadosValidados = validarDadosAjuste(dados || {});
    const item = await AjusteRepository.criar(dadosValidados);
    return { sucesso: true, mensagem: "Ajuste registrado com sucesso.", dados: item };
  }

  async atualizar(id, dados) {
    validarId(id);
    const atual = await AjusteRepository.buscarPorId(id);
    if (!atual) throw { status: 404, mensagem: "Ajuste não encontrado" };

    const dadosValidados = validarDadosAjuste({ ...atual, ...(dados || {}) });
    const item = await AjusteRepository.atualizar(id, dadosValidados);
    return { sucesso: true, mensagem: "Ajuste atualizado com sucesso.", dados: item };
  }
}

module.exports = new AjusteService();
