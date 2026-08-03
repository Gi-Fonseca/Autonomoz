const FuncionarioRepository = require("../repositories/FuncionarioRepository");

class FuncionarioService {

    // Lista todos os funcionários, chamando o método correspondente no Repository
    async listar() {
        const funcionarios = await FuncionarioRepository.findAll();
        return { sucesso: true, dados: funcionarios };
    }

    // Busca um funcionário por ID, com validação do ID e tratamento de "não encontrado"
    async buscarPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }
        const funcionario = await FuncionarioRepository.findById(id);
        if (!funcionario) {
            throw { status: 404, mensagem: "Funcionário não encontrado" };
        }
        return { sucesso: true, dados: funcionario };
    }

    // Cadastra um novo funcionário, aplicando todas as validações da imagem
    async cadastrar(dados) {
        const { cargo, nome, cpf, email, senha } = dados;

        // 1. Validações básicas de campos obrigatórios
        if (!cargo || !nome || !cpf || !email || !senha) {
            throw { status: 400, mensagem: "Todos os campos são obrigatórios" };
        }

        // 2. Validação de Cargo (Estoquista ou Gerente)
        const cargosValidos = ["Estoquista", "Gerente", "estoquista", "gerente"];
        if (!cargosValidos.includes(cargo)) {
            throw { status: 400, mensagem: "Cargo deve ser 'Estoquista' ou 'Gerente'" };
        }

        // 3. Validação de CPF (11 dígitos numéricos)
        const cpfLimpo = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cpfLimpo.length !== 11) {
            throw { status: 400, mensagem: "CPF deve conter 11 dígitos numéricos" };
        }

// 4. Validação de Email (formato válido)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    throw {
        status: 400,
        mensagem: "Formato de e-mail inválido"
    };
}

        if (!emailRegex.test(email)) {
            throw { status: 400, mensagem: "Formato de e-mail inválido" };
        }

        // 5. Validação de Senha (mínimo 8 caracteres)
        if (senha.length < 8) {
            throw { status: 400, mensagem: "A senha deve ter no mínimo 8 caracteres" };
        }

        // 6. Verificar unicidade de Email e CPF no banco de dados
        const emailExiste = await FuncionarioRepository.findByEmail(email);
        if (emailExiste) {
            throw { status: 400, mensagem: "Este e-mail já está cadastrado" };
        }

        const cpfExiste = await FuncionarioRepository.findByCpf(cpfLimpo);
        if (cpfExiste) {
            throw { status: 400, mensagem: "Este CPF já está cadastrado" };
        }

        // Se todas as validações passarem, chama o Repository para criar o funcionário
        const id = await FuncionarioRepository.create({
            cargo,
            nome: nome.trim(), // Remove espaços em branco
            cpf: cpfLimpo,
            email: email.toLowerCase(), // Salva e-mail em minúsculas
            senha // IMPORTANTE: Em um projeto real, a senha DEVE ser hashada (ex: bcrypt) antes de salvar!
        });

        return { sucesso: true, mensagem: "Funcionário cadastrado com sucesso", id };
    }

    // Atualiza um funcionário existente, com validações específicas para atualização
    async atualizar(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const existe = await FuncionarioRepository.findById(id);
        if (!existe) {
            throw { status: 404, mensagem: "Funcionário não encontrado" };
        }

        // Validação de unicidade de e-mail durante a atualização
        if (dados.email) {
            const emailExiste = await FuncionarioRepository.findByEmail(dados.email);
            // Verifica se o e-mail já existe E se pertence a outro funcionário
            if (emailExiste && emailExiste.id !== parseInt(id)) {
                throw { status: 400, mensagem: "Este e-mail já está em uso por outro funcionário" };
            }
        }

        // Chama o Repository para realizar a atualização
        await FuncionarioRepository.update(id, dados);
        return { sucesso: true, mensagem: "Funcionário atualizado com sucesso" };
    }

    // Deleta um funcionário, com validação do ID e tratamento de "não encontrado"
    async deletar(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }
        const deletado = await FuncionarioRepository.delete(id);
        if (!deletado) {
            throw { status: 404, mensagem: "Funcionário não encontrado" };
        }
        return { sucesso: true, mensagem: "Funcionário removido com sucesso" };
    }
}

module.exports = new FuncionarioService();
