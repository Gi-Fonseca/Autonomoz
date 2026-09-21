const ProdutoRepository = require("../repositories/ProdutoRepository");

class ProdutoService {
  // Lista produtos
  async listarProdutos() {
    const produtos = await ProdutoRepository.listarProdutos();

    return {
      sucesso: true,
      dados: produtos,
      total: produtos.length,
    };
  }

  // Busca produto
  async buscarProdutoId(id) {
    if (!id || isNaN(id)) {
      throw {
        status: 400,
        mensagem: "ID inválido",
      };
    }

    const produto = await ProdutoRepository.buscarProdutoId(id);

    if (!produto) {
      throw {
        status: 404,
        mensagem: "Produto não encontrado",
      };
    }

    return {
      sucesso: true,
      dados: produto,
    };
  }

  // Valida produto
  async publicarProduto(dados) {
    const { nome, quantidade, validade, id_categoria, id_fornecedor, status } =
      dados;

    if (
      !nome ||
      quantidade === undefined ||
      !id_categoria ||
      !id_fornecedor ||
      status === undefined
    ) {
      throw {
        status: 400,
        mensagem:
          "Nome, quantidade, categoria, fornecedor e status são obrigatórios",
      };
    }

    if (isNaN(quantidade) || quantidade < 0) {
      throw {
        status: 400,
        mensagem: "Quantidade deve ser um número maior ou igual a 0",
      };
    }

    const novoProduto = {
      nome: nome.trim(),
      quantidade,
      validade: validade || null,
      id_categoria,
      id_fornecedor,
      status,
    };

    const id = await ProdutoRepository.publicarProduto(novoProduto);

    return {
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso",
      id,
    };
  }

  // Atualiza produto
  async alterarDados(id, dados) {
    if (!id || isNaN(id)) {
      throw {
        status: 400,
        mensagem: "ID inválido",
      };
    }

    const produto = await ProdutoRepository.buscarProdutoId(id);

    if (!produto) {
      throw {
        status: 404,
        mensagem: "Produto não encontrado",
      };
    }

    const dadosPermitidos = {};

    const camposPermitidos = [
      "nome",
      "quantidade",
      "validade",
      "id_categoria",
      "id_fornecedor",
      "status",
    ];

    // Filtra campos
    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    if (dadosPermitidos.quantidade !== undefined) {
      if (isNaN(dadosPermitidos.quantidade) || dadosPermitidos.quantidade < 0) {
        throw {
          status: 400,
          mensagem: "Quantidade deve ser um número maior ou igual a 0",
        };
      }
    }

    if (dadosPermitidos.nome !== undefined) {
      dadosPermitidos.nome = dadosPermitidos.nome.trim();
    }

    if (Object.keys(dadosPermitidos).length === 0) {
      throw {
        status: 400,
        mensagem: "Nenhum dado enviado para atualização",
      };
    }

    await ProdutoRepository.alterarDados(id, dadosPermitidos);

    return {
      sucesso: true,
      mensagem: "Produto atualizado com sucesso",
    };
  }

  async desativarProduto(id) {
    if (!id || isNaN(id)) {
      throw {
        status: 400,
        mensagem: "ID inválido",
      };
    }

    const produto = await ProdutoRepository.buscarProdutoId(id);

    if (!produto) {
      throw {
        status: 404,
        mensagem: "Produto não encontrado",
      };
    }

    if (Number(produto.status) === 0) {
      throw {
        status: 400,
        mensagem: "Produto já está inativo",
      };
    }

    await ProdutoRepository.desativarProduto(id);

    return {
      sucesso: true,
      mensagem: "Produto removido com sucesso",
    };
  }
}

module.exports = new ProdutoService();
