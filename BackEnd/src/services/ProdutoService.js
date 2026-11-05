const ProdutoRepository = require("../repositories/ProdutoRepository");
const CategoriaRepository = require("../repositories/CategoriaRepository");

function numero(valor, nome, minimo = 0) {
  if (
    valor === undefined ||
    valor === null ||
    valor === "" ||
    isNaN(valor) ||
    Number(valor) < minimo
  ) {
    throw {
      status: 400,
      mensagem: `${nome} deve ser um número maior ou igual a ${minimo}`,
    };
  }
  return Number(valor);
}

class ProdutoService {
  // Lista produtos
  async listarProdutos(filtros = {}) {
    const produtos = await ProdutoRepository.listarProdutos(filtros);
    return { sucesso: true, dados: produtos, total: produtos.length };
  }

  // Busca produto
  async buscarProdutoId(id) {
    if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
    const produto = await ProdutoRepository.buscarProdutoId(id);
    if (!produto) throw { status: 404, mensagem: "Produto não encontrado" };
    return { sucesso: true, dados: produto };
  }

  // Valida e cria produto
  async publicarProduto(dados = {}) {
    const nome = String(dados.nome || "").trim();
    const tipo_item = String(dados.tipo_item || "PECA").toUpperCase();
    if (
      !nome ||
      (!dados.id_categoria && !String(dados.categoria || "").trim()) ||
      !dados.id_fornecedor ||
      dados.status === undefined
    ) {
      throw {
        status: 400,
        mensagem: "Nome, categoria, fornecedor e status são obrigatórios",
      };
    }
    if (!["PECA", "VEICULO"].includes(tipo_item)) {
      throw { status: 400, mensagem: "tipo_item deve ser PECA ou VEICULO" };
    }
    let categoria;
    if (dados.categoria) {
      const nomeDigitado = String(dados.categoria).trim();
      const categorias = await CategoriaRepository.listarCategoria();
      categoria = categorias.find(
        (item) =>
          String(item.tipo_produto).trim().toLowerCase() ===
          nomeDigitado.toLowerCase(),
      );
      if (!categoria) {
        const nomeNovo = nomeDigitado.toLowerCase();
        const novoEhVeiculo =
          nomeNovo.includes("veícul") || nomeNovo.includes("veicul");
        const novoEhPeca =
          nomeNovo.includes("peç") ||
          nomeNovo.includes("peca") ||
          nomeNovo.includes("reposição") ||
          nomeNovo.includes("reposicao");
        if (
          (tipo_item === "VEICULO" && novoEhPeca) ||
          (tipo_item === "PECA" && novoEhVeiculo)
        ) {
          throw {
            status: 400,
            mensagem:
              "A categoria digitada não corresponde ao tipo escolhido.",
          };
        }
        const idCategoria = await CategoriaRepository.publicarCategoria({
          tipo_produto: nomeDigitado,
        });
        categoria = {
          id_categoria: idCategoria,
          tipo_produto: nomeDigitado,
        };
      }
    } else {
      categoria = await CategoriaRepository.buscarCategoriaId(
        dados.id_categoria,
      );
    }
    if (!categoria) throw { status: 400, mensagem: "Categoria não encontrada" };
    const nomeCategoria = String(categoria.tipo_produto || "").toLowerCase();
    const categoriaVeiculo =
      nomeCategoria.includes("veícul") || nomeCategoria.includes("veicul");
    const categoriaPeca =
      nomeCategoria.includes("peç") ||
      nomeCategoria.includes("peca") ||
      nomeCategoria.includes("reposição") ||
      nomeCategoria.includes("reposicao");
    if (
      (categoriaVeiculo && tipo_item !== "VEICULO") ||
      (categoriaPeca && tipo_item !== "PECA")
    ) {
      throw {
        status: 400,
        mensagem:
          "A categoria precisa corresponder ao tipo escolhido: peças com peças e veículos com veículos.",
      };
    }
    const novoProduto = {
      nome,
      descricao: dados.descricao ? String(dados.descricao).trim() : null,
      tipo_item,
      quantidade: numero(dados.quantidade ?? 0, "Quantidade"),
      estoque_minimo: numero(dados.estoque_minimo ?? 0, "Estoque mínimo"),
      validade: dados.validade || null,
      id_categoria: Number(categoria.id_categoria),
      id_fornecedor: Number(dados.id_fornecedor),
      status: Boolean(dados.status),
      chassi: dados.chassi ? String(dados.chassi).trim() : null,
      placa: dados.placa ? String(dados.placa).trim().toUpperCase() : null,
      ano: dados.ano ? Number(dados.ano) : null,
      foto: dados.foto || null,
    };
    if (tipo_item === "VEICULO" && !novoProduto.chassi && !novoProduto.placa) {
      throw {
        status: 400,
        mensagem: "Veículos devem informar chassi ou placa",
      };
    }
    const id = await ProdutoRepository.publicarProduto(novoProduto);
    return {
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso",
      dados: { id },
    };
  }

  // Atualiza produto
  async alterarDados(id, dados = {}) {
    if (!id || isNaN(id)) throw { status: 400, mensagem: "ID inválido" };
    if (!(await ProdutoRepository.buscarProdutoId(id)))
      throw { status: 404, mensagem: "Produto não encontrado" };
    const permitido = {};
    // Filtra campos permitidos
    const campos = [
      "nome",
      "descricao",
      "tipo_item",
      "quantidade",
      "estoque_minimo",
      "validade",
      "id_categoria",
      "id_fornecedor",
      "status",
      "chassi",
      "placa",
      "ano",
      "foto",
    ];
    for (const campo of campos)
      if (dados[campo] !== undefined) permitido[campo] = dados[campo];
    if (permitido.nome !== undefined)
      permitido.nome = String(permitido.nome).trim();
    if (permitido.placa !== undefined && permitido.placa !== null)
      permitido.placa = String(permitido.placa).trim().toUpperCase();
    if (permitido.quantidade !== undefined)
      permitido.quantidade = numero(permitido.quantidade, "Quantidade");
    if (permitido.estoque_minimo !== undefined)
      permitido.estoque_minimo = numero(
        permitido.estoque_minimo,
        "Estoque mínimo",
      );
    if (permitido.ano !== undefined && permitido.ano !== null)
      permitido.ano = numero(permitido.ano, "Ano", 1886);
    if (
      permitido.tipo_item !== undefined &&
      !["PECA", "VEICULO"].includes(String(permitido.tipo_item).toUpperCase())
    )
      throw { status: 400, mensagem: "tipo_item deve ser PECA ou VEICULO" };
    if (!Object.keys(permitido).length)
      throw { status: 400, mensagem: "Nenhum dado enviado para atualização" };
    await ProdutoRepository.alterarDados(id, permitido);
    return {
      sucesso: true,
      mensagem: "Produto atualizado com sucesso",
      dados: { id_produto: Number(id), ...permitido },
    };
  }

  async alertas() {
    const dados = await ProdutoRepository.listarAlertas();
    return { sucesso: true, dados, total: dados.length };
  }
}

module.exports = new ProdutoService();
