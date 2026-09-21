const CategoriaRepository = require("../repositories/CategoriaRepository");
function validarId(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}
class CategoriaService {
  async listarCategoria() {
    return await CategoriaRepository.listarCategoria();
  }
  async buscarCategoriaId(id) {
    validarId(id);
    const item = await CategoriaRepository.buscarCategoriaId(id);
    if (!item) throw { status: 404, mensagem: "Categoria não encontrada" };
    return item;
  }
  async publicarCategoria(dados) {
    const tipo = dados && dados.tipo_produto;
    if (!tipo || !tipo.trim())
      throw { status: 400, mensagem: "O campo tipo_produto é obrigatório" };
    const valor = tipo.trim();
    const id = await CategoriaRepository.publicarCategoria({
      tipo_produto: valor,
    });
    return { id_categoria: id, tipo_produto: valor };
  }
  async alterarDadosId(id, dados) {
    validarId(id);
    await this.buscarCategoriaId(id);
    const tipo = dados && dados.tipo_produto;
    if (!tipo || !tipo.trim())
      throw { status: 400, mensagem: "O campo tipo_produto é obrigatório" };
    const valor = tipo.trim();
    const n = await CategoriaRepository.alterarDadosId(id, {
      tipo_produto: valor,
    });
    if (!n) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return { id_categoria: Number(id), tipo_produto: valor };
  }
  async deletarCategoria(id) {
    validarId(id);
    await this.buscarCategoriaId(id);
    await CategoriaRepository.deletarCategoria(id);
    return { id_categoria: Number(id) };
  }
}
module.exports = new CategoriaService();
