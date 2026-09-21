const ClienteRepository = require("../repositories/ClienteRepository");
function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}
class ClienteService {
  async listar() {
    return await ClienteRepository.listar();
  }

  async buscarPorId(id) {
    validarId(id);
    const item = await ClienteRepository.buscarPorId(id);
    if (!item) throw { status: 404, mensagem: "Cliente não encontrado" };
    return item;
  }

  async criar(dados) {
    if (!dados || !dados.nome || !dados.email)
      throw { status: 400, mensagem: "Nome e email são obrigatórios" };
    const id = await ClienteRepository.criar(dados);
    return { id_cliente: id, ...dados };
  }

  async atualizar(id, dados) {
    validarId(id);
    await this.buscarPorId(id);
    const body = dados || {};
    const permitidos = {};
    for (const campo of ["nome", "email", "cadastro"])
      if (body[campo] !== undefined) permitidos[campo] = body[campo];
    if (!Object.keys(permitidos).length)
      throw { status: 400, mensagem: "Nenhum dado enviado para atualização" };
    const alterado = await ClienteRepository.atualizar(id, permitidos);
    if (!alterado) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return { id_cliente: Number(id), ...permitidos };
  }

  async excluir(id) {
    validarId(id);
    await this.buscarPorId(id);
    const excluido = await ClienteRepository.excluir(id);
    if (!excluido) throw { status: 409, mensagem: "Cliente não foi excluído" };
    return { id_cliente: Number(id) };
  }
}
module.exports = new ClienteService();
