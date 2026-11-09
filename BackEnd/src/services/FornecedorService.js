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
    const fornecedor = {
      nome: String(dados?.nome || "").trim(),
      cnpj: String(dados?.cnpj || "").replace(/\D/g, ""),
      telefone: String(dados?.telefone || "").replace(/\D/g, ""),
      email: String(dados?.email || "")
        .trim()
        .toLowerCase(),
    };
    if (
      !fornecedor.nome ||
      !fornecedor.cnpj ||
      !fornecedor.telefone ||
      !fornecedor.email
    )
      throw {
        status: 400,
        mensagem: "Nome, CNPJ, telefone e email são obrigatórios",
      };
    if (fornecedor.cnpj.length < 11 || fornecedor.cnpj.length > 14)
      throw { status: 400, mensagem: "CNPJ deve conter entre 11 e 14 números" };
    if (fornecedor.telefone.length < 10 || fornecedor.telefone.length > 13)
      throw {
        status: 400,
        mensagem: "Telefone deve conter entre 10 e 13 números",
      };
    const id = await FornecedorRepository.criar(fornecedor);
    return { id_fornecedor: id, ...fornecedor };
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
