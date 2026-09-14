const FuncionarioRepository = require("../repositories/FuncionarioRepository");

class FuncionarioService {

    async listar() {

        const funcionarios = await FuncionarioRepository.findAll();

        return {
            sucesso: true,
            dados: funcionarios,
            total: funcionarios.length
        };
    }

    async buscarPorId(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const funcionario = await FuncionarioRepository.findById(id);

        if (!funcionario) {
            throw {
                status: 404,
                mensagem: "Funcionário não encontrado"
            };
        }

        return {
            sucesso: true,
            dados: funcionario
        };
    }

    async cadastrar(dados) {

        const {
            cargo,
            nome,
            cpf,
            email,
            senha
        } = dados;

        if (!cargo || !nome || !cpf || !email || !senha) {
            throw {
                status: 400,
                mensagem: "Todos os campos são obrigatórios"
            };
        }

        const cargosValidos = [
            "Estoquista",
            "Gerente",
            "estoquista",
            "gerente"
        ];

        if (!cargosValidos.includes(cargo)) {
            throw {
                status: 400,
                mensagem: "Cargo deve ser 'Estoquista' ou 'Gerente'"
            };
        }

        const cpfLimpo = cpf.replace(/\D/g, "");

        if (cpfLimpo.length !== 11) {
            throw {
                status: 400,
                mensagem: "CPF deve conter 11 dígitos numéricos"
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw {
                status: 400,
                mensagem: "Formato de e-mail inválido"
            };
        }

        if (senha.length < 8) {
            throw {
                status: 400,
                mensagem: "A senha deve ter no mínimo 8 caracteres"
            };
        }

        const emailExiste = await FuncionarioRepository.findByEmail(email);

        if (emailExiste) {
            throw {
                status: 400,
                mensagem: "Este e-mail já está cadastrado"
            };
        }

        const cpfExiste = await FuncionarioRepository.findByCpf(cpfLimpo);

        if (cpfExiste) {
            throw {
                status: 400,
                mensagem: "Este CPF já está cadastrado"
            };
        }

        const novoFuncionario = {
            cargo,
            nome: nome.trim(),
            cpf: cpfLimpo,
            email: email.toLowerCase(),
            senha
        };

        const id = await FuncionarioRepository.create(novoFuncionario);

        return {
            sucesso: true,
            mensagem: "Funcionário cadastrado com sucesso",
            id
        };
    }

    async atualizar(id, dados) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const existe = await FuncionarioRepository.findById(id);

        if (!existe) {
            throw {
                status: 404,
                mensagem: "Funcionário não encontrado"
            };
        }

        const atualizado = {};

        const {
            cargo,
            nome,
            cpf,
            email,
            senha
        } = dados;

        if (cargo !== undefined) {
            atualizado.cargo = cargo;
        }

        if (nome !== undefined) {
            atualizado.nome = nome.trim();
        }

        if (cpf !== undefined) {
            atualizado.cpf = cpf.replace(/\D/g, "");
        }

        if (email !== undefined) {

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                throw {
                    status: 400,
                    mensagem: "Formato de e-mail inválido"
                };
            }

            const emailExiste = await FuncionarioRepository.findByEmail(email);

            if (emailExiste && emailExiste.id !== parseInt(id)) {
                throw {
                    status: 400,
                    mensagem: "Este e-mail já está em uso por outro funcionário"
                };
            }

            atualizado.email = email.toLowerCase();
        }

        if (senha !== undefined) {

            if (senha.length < 8) {
                throw {
                    status: 400,
                    mensagem: "A senha deve ter no mínimo 8 caracteres"
                };
            }

            atualizado.senha = senha;
        }

        if (Object.keys(atualizado).length === 0) {
            throw {
                status: 400,
                mensagem: "Nenhum dado válido enviado para atualização"
            };
        }

        await FuncionarioRepository.update(id, atualizado);

        return {
            sucesso: true,
            mensagem: "Funcionário atualizado com sucesso"
        };
    }

    async deletar(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const existe = await FuncionarioRepository.findById(id);

        if (!existe) {
            throw {
                status: 404,
                mensagem: "Funcionário não encontrado"
            };
        }

        await FuncionarioRepository.delete(id);

        return {
            sucesso: true,
            mensagem: "Funcionário removido com sucesso"
        };
    }
}

module.exports = new FuncionarioService();