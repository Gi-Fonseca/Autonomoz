const EstoqueRepository = require("../repositories/EstoqueRepository");
function idValido(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}
class EstoqueService {
  async listarEstoque() {
    const dados = await EstoqueRepository.listarEstoque();
    return { sucesso: true, dados, total: dados.length };
  }

  async buscarEstoqueId(id) {
    idValido(id);
    const item = await EstoqueRepository.buscarEstoqueId(id);
    if (!item) throw { status: 404, mensagem: "Estoque não encontrado" };
    return { sucesso: true, dados: item };
  }
  async publicarEstoque(dados) {
    const { id_produto, id_lote, valor_unitario, localizacao } = dados || {};
    if (
      !id_produto ||
      !id_lote ||
      valor_unitario === undefined ||
      typeof localizacao !== "string" ||
      !localizacao.trim()
    )
      throw {
        status: 400,
        mensagem:
          "id_produto, id_lote, valor_unitario e localizacao são obrigatórios",
      };
    if (isNaN(valor_unitario) || Number(valor_unitario) < 0)
      throw {
        status: 400,
        mensagem: "Valor unitário deve ser maior ou igual a 0",
      };
    const novo = {
      id_produto: Number(id_produto),
      id_lote: Number(id_lote),
      valor_unitario: Number(valor_unitario),
      localizacao: localizacao.trim(),
    };
    const id = await EstoqueRepository.publicarEstoque(novo);
    return {
      sucesso: true,
      mensagem: "Estoque cadastrado com sucesso",
      dados: { id_estoque: id, ...novo },
    };
  }
  async alterarDadosId(id, dados) {
    idValido(id);
    await this.buscarEstoqueId(id);
    const permitido = {};
    const body = dados || {};
    for (const campo of [
      "id_produto",
      "id_lote",
      "valor_unitario",
      "localizacao",
    ])
      if (body[campo] !== undefined) permitido[campo] = body[campo];
    if (permitido.id_produto !== undefined)
      permitido.id_produto = Number(permitido.id_produto);
    if (permitido.id_lote !== undefined)
      permitido.id_lote = Number(permitido.id_lote);
    if (permitido.valor_unitario !== undefined) {
      if (
        isNaN(permitido.valor_unitario) ||
        Number(permitido.valor_unitario) < 0
      )
        throw {
          status: 400,
          mensagem: "Valor unitário deve ser maior ou igual a 0",
        };
      permitido.valor_unitario = Number(permitido.valor_unitario);
    }
    if (permitido.localizacao !== undefined) {
      if (
        typeof permitido.localizacao !== "string" ||
        !permitido.localizacao.trim()
      )
        throw { status: 400, mensagem: "Localização não pode ser vazia" };
      permitido.localizacao = permitido.localizacao.trim();
    }
    if (!Object.keys(permitido).length)
      throw { status: 400, mensagem: "Nenhum dado enviado para atualização" };
    await EstoqueRepository.alterarDadosId(id, permitido);
    return {
      sucesso: true,
      mensagem: "Estoque atualizado com sucesso",
      dados: { id_estoque: Number(id), ...permitido },
    };
  }
  async deletarEstoque(id) {
    idValido(id);
    await this.buscarEstoqueId(id);
    await EstoqueRepository.deletarEstoque(id);
    return {
      sucesso: true,
      mensagem: "Estoque removido com sucesso",
      dados: { id_estoque: Number(id) },
    };
  }
}
module.exports = new EstoqueService();
