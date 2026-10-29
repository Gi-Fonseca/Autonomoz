const AjusteRepository = require("../repositories/AjusteRepository");
function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
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
      Number(dados.quantidade) === 0 ||
      !dados.motivo_ajuste
    )
      throw {
        status: 400,
        mensagem:
          "Produto, funcionário, quantidade, data e motivo do ajuste são obrigatórios",
      };
    const id = await AjusteRepository.criar(dados);
    return { id_ajuste: id, ...dados };
  }
  async atualizar(id, dados) {
    validarId(id);
    await this.buscarPorId(id);
    const n = await AjusteRepository.atualizar(id, dados);
    if (!n) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return { id_ajuste: Number(id), alterado: n };
  }
}
module.exports = new AjusteService();
