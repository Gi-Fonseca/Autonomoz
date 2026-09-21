const FornecedorRepository = require("../repositories/FornecedorRepository");
function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}
class FornecedorService {
  async listar() {
    return await FornecedorRepository.listar();
  }
  async buscarPorId(id) {
    validarId(id);
    const item = await FornecedorRepository.buscarPorId(id);
    if (!item) throw { status: 404, mensagem: "Fornecedor não encontrado" };
    return item;
  }
  async criar(dados) {
    if (!dados || !dados.nome || !dados.cnpj || !dados.telefone || !dados.email)
      throw {
        status: 400,
        mensagem: "Nome, CNPJ, telefone e email são obrigatórios",
      };
    const id = await FornecedorRepository.criar(dados);
    return { id_fornecedor: id, ...dados };
  }
  async atualizar(id, dados) {
    validarId(id);
    await this.buscarPorId(id);
    const body = dados || {};
    const permitidos = {};
    for (const campo of ["nome", "cnpj", "telefone", "email"])
      if (body[campo] !== undefined) permitidos[campo] = body[campo];
    if (!Object.keys(permitidos).length)
      throw { status: 400, mensagem: "Nenhum dado enviado para atualização" };
    const alterado = await FornecedorRepository.atualizar(id, permitidos);
    if (!alterado) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return { id_fornecedor: Number(id), ...permitidos };
  }
  async excluir(id) {
    validarId(id);
    await this.buscarPorId(id);
    await FornecedorRepository.excluir(id);
    return { id_fornecedor: Number(id) };
  }
}
module.exports = new FornecedorService();
