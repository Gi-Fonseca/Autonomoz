const bcrypt = require("bcryptjs");
const { gerarToken } = require("../middlewares/auth");
const FuncionarioRepository = require("../repositories/FuncionarioRepository");
const cargos = ["Estoquista", "Gerente"];
function idValido(id) {
  if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
}
function publico(u) {
  return { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo };
}
class FuncionarioService {
  async listar() {
    const dados = await FuncionarioRepository.findAll();
    return { sucesso: true, dados, total: dados.length };
  }
  async buscarPorId(id) {
    idValido(id);
    const u = await FuncionarioRepository.findById(id);
    if (!u) throw { status: 404, mensagem: "Funcionário não encontrado" };
    return { sucesso: true, dados: u };
  }
  async cadastrar(dados) {
    if (
      !dados ||
      !dados.cargo ||
      !dados.nome ||
      !dados.cpf ||
      !dados.email ||
      !dados.senha
    )
      throw { status: 400, mensagem: "Todos os campos são obrigatórios" };
    const cargo = cargos.find(
      (c) => c.toLowerCase() === String(dados.cargo).toLowerCase(),
    );
    if (!cargo)
      throw {
        status: 400,
        mensagem: "Cargo deve ser 'Estoquista' ou 'Gerente'",
      };
    const cpf = String(dados.cpf).replace(/\D/g, "");
    if (cpf.length !== 11)
      throw { status: 400, mensagem: "CPF deve conter 11 dígitos numéricos" };
    const email = String(dados.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw { status: 400, mensagem: "Formato de e-mail inválido" };
    if (String(dados.senha).length < 8)
      throw {
        status: 400,
        mensagem: "A senha deve ter no mínimo 8 caracteres",
      };
    if (await FuncionarioRepository.findByEmail(email))
      throw { status: 400, mensagem: "Este e-mail já está cadastrado" };
    if (await FuncionarioRepository.findByCpf(cpf))
      throw { status: 400, mensagem: "Este CPF já está cadastrado" };
    const id = await FuncionarioRepository.create({
      cargo,
      nome: String(dados.nome).trim(),
      cpf,
      email,
      senha: await bcrypt.hash(String(dados.senha), 12),
    });
    return {
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso",
      dados: { id, nome: String(dados.nome).trim(), email, cargo },
    };
  }
  async atualizar(id, dados) {
    idValido(id);
    const atual = await FuncionarioRepository.findById(id);
    if (!atual) throw { status: 404, mensagem: "Funcionário não encontrado" };
    const body = dados || {};
    const n = {};
    if (body.cargo !== undefined) {
      const cargo = cargos.find(
        (c) => c.toLowerCase() === String(body.cargo).toLowerCase(),
      );
      if (!cargo) throw { status: 400, mensagem: "Cargo inválido" };
      n.cargo = cargo;
    }
    if (body.nome !== undefined) n.nome = String(body.nome).trim();
    if (body.cpf !== undefined) {
      n.cpf = String(body.cpf).replace(/\D/g, "");
      if (n.cpf.length !== 11)
        throw { status: 400, mensagem: "CPF deve conter 11 dígitos numéricos" };
    }
    if (body.email !== undefined) {
      n.email = String(body.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.email))
        throw { status: 400, mensagem: "Formato de e-mail inválido" };
    }
    if (body.senha !== undefined) {
      if (String(body.senha).length < 8)
        throw {
          status: 400,
          mensagem: "A senha deve ter no mínimo 8 caracteres",
        };
      n.senha = await bcrypt.hash(String(body.senha), 12);
    }
    if (!Object.keys(n).length)
      throw {
        status: 400,
        mensagem: "Nenhum dado válido enviado para atualização",
      };
    const r = await FuncionarioRepository.update(id, n);
    if (!r) throw { status: 409, mensagem: "Nenhum dado foi alterado" };
    return {
      sucesso: true,
      mensagem: "Funcionário atualizado com sucesso",
      dados: { id: Number(id), ...n, senha: undefined },
    };
  }
  async deletar(id) {
    idValido(id);
    if (!(await FuncionarioRepository.findById(id)))
      throw { status: 404, mensagem: "Funcionário não encontrado" };
    await FuncionarioRepository.delete(id);
    return {
      sucesso: true,
      mensagem: "Funcionário removido com sucesso",
      dados: { id: Number(id) },
    };
  }
  async login(email, senha) {
    const u = await FuncionarioRepository.findByEmail(
      String(email || "")
        .trim()
        .toLowerCase(),
    );
    if (!u || !(await bcrypt.compare(String(senha || ""), u.senha)))
      throw { status: 401, mensagem: "E-mail ou senha inválidos" };
    const usuario = publico(u);
    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso",
      dados: { token: gerarToken(usuario), usuario },
    };
  }
}
module.exports = new FuncionarioService();
