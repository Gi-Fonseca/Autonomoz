const LoteRepository = require("../repositories/LoteRepository");
function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}
class LoteService {
  async listar() {
    return await LoteRepository.listar();
  }
  async buscarPorId(id) {
    validarId(id);
    const item = await LoteRepository.buscarPorId(id);
    if (!item) throw { status: 404, mensagem: "Lote não encontrado" };
    return item;
  }
  async criar(dados) {
    if (!dados || dados.quantidade === undefined)
      throw { status: 400, mensagem: "A quantidade é obrigatória" };
    if (isNaN(dados.quantidade) || dados.quantidade < 0)
      throw { status: 400, mensagem: "A quantidade não pode ser negativa" };
    const id = await LoteRepository.criar(dados);
    return { id_lote: id, quantidade: Number(dados.quantidade) };
  }
  async atualizar(id, dados) {
    validarId(id);
    await this.buscarPorId(id);
    if (
      !dados ||
      dados.quantidade === undefined ||
      isNaN(dados.quantidade) ||
      dados.quantidade < 0
    )
      throw { status: 400, mensagem: "Quantidade válida é obrigatória" };
    const n = await LoteRepository.atualizar(id, {
      quantidade: Number(dados.quantidade),
    });
    if (!n) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return { id_lote: Number(id), quantidade: Number(dados.quantidade) };
  }
}
module.exports = new LoteService();
