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
      preco_custo: numero(dados.preco_custo ?? 0, "Preço de custo"),
      preco_venda: numero(dados.preco_venda ?? 0, "Preço de venda"),
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
    const atual = await ProdutoRepository.buscarProdutoId(id);
    if (!atual)
      throw { status: 404, mensagem: "Produto não encontrado" };
    const motivo = String(dados.motivo_ajuste || "").trim();
    if (!motivo) throw { status: 400, mensagem: "O motivo do ajuste é obrigatório." };
    if (motivo.length > 255) throw { status: 400, mensagem: "O motivo deve ter no máximo 255 caracteres." };
    const id_funcionario = Number(dados.id_funcionario);
    if (!Number.isInteger(id_funcionario) || id_funcionario <= 0)
      throw { status: 400, mensagem: "Não foi possível identificar o responsável pelo ajuste." };
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
      "preco_custo",
      "preco_venda",
    ];
    for (const campo of campos)
      if (dados[campo] !== undefined) permitido[campo] = dados[campo];
    permitido.id_funcionario = id_funcionario;
    permitido.motivo_ajuste = motivo;
    if (dados.categoria !== undefined) {
      const nomeCategoria = String(dados.categoria || "").trim();
      if (!nomeCategoria) throw { status: 400, mensagem: "A categoria é obrigatória." };
      const categorias = await CategoriaRepository.listarCategoria();
      let categoria = categorias.find(
        (item) => String(item.tipo_produto).trim().toLowerCase() === nomeCategoria.toLowerCase(),
      );
      if (!categoria) {
        const idCategoria = await CategoriaRepository.publicarCategoria({ tipo_produto: nomeCategoria });
        categoria = { id_categoria: idCategoria, tipo_produto: nomeCategoria };
      }
      const tipoProduto = String(permitido.tipo_item || atual.tipo_item || "PECA").toUpperCase();
      const nomeNormalizado = String(categoria.tipo_produto || "").toLowerCase();
      const categoriaVeiculo = nomeNormalizado.includes("veicul");
      const categoriaPeca = nomeNormalizado.includes("pec") || nomeNormalizado.includes("peç");
      if ((categoriaVeiculo && tipoProduto !== "VEICULO") || (categoriaPeca && tipoProduto !== "PECA")) {
        throw { status: 400, mensagem: "A categoria precisa corresponder ao tipo escolhido." };
      }
      permitido.id_categoria = Number(categoria.id_categoria);
    }
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
    if (permitido.preco_custo !== undefined)
      permitido.preco_custo = numero(permitido.preco_custo, "Preço de custo");
    if (permitido.preco_venda !== undefined)
      permitido.preco_venda = numero(permitido.preco_venda, "Preço de venda");
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
      mensagem: "Cadastro ajustado com sucesso; motivo registrado no histórico.",
      dados: { id_produto: Number(id), ...permitido },
    };
  }

  async alertas() {
    const dados = await ProdutoRepository.listarAlertas();
    return { sucesso: true, dados, total: dados.length };
  }
}

module.exports = new ProdutoService();
