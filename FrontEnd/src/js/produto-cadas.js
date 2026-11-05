document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  await carregarSelects();
  configurarCategoriaPorTipo();
  configurarFormularioProduto();
});

let categoriasDisponiveis = [];

async function lerDadosResposta(resposta) {
  const resultado = await resposta.json();

  if (!resposta.ok || resultado.sucesso === false) {
    throw new Error(resultado.mensagem || "Erro ao consultar a API.");
  }

  return resultado.dados !== undefined ? resultado.dados : resultado;
}

async function carregarSelects() {
  try {
    const [respostaCategorias, respostaFornecedores] = await Promise.all([
      fetchAutenticado("/categoria"),
      fetchAutenticado("/fornecedor"),
    ]);

    if (respostaCategorias) {
      const categorias = await lerDadosResposta(respostaCategorias);
      const selectCategoria = document.getElementById("prod-categoria");

      if (selectCategoria && Array.isArray(categorias)) {
        categoriasDisponiveis = categorias;
        atualizarCategoriasPorTipo();
      }
    }

    if (respostaFornecedores) {
      const fornecedores = await lerDadosResposta(respostaFornecedores);
      const selectFornecedor = document.getElementById("prod-fornecedor");

      if (selectFornecedor && Array.isArray(fornecedores)) {
        selectFornecedor.innerHTML = fornecedores
          .map(
            (fornecedor) =>
              `<option value="${fornecedor.id_fornecedor}">${fornecedor.nome}</option>`,
          )
          .join("");
      }
    }
  } catch (erro) {
    console.error("Erro ao carregar categorias e fornecedores:", erro);
  }
}

function categoriaPertenceAoTipo(categoria, tipo) {
  const nome = String(categoria?.tipo_produto || "").toLowerCase();
  if (tipo === "VEICULO") return nome.includes("veícul") || nome.includes("veicul");
  return nome.includes("peç") || nome.includes("peca") || nome.includes("reposição") || nome.includes("reposicao");
}

function atualizarCategoriasPorTipo() {
  const selectTipo = document.getElementById("prod-tipo");
  const listaCategorias = document.getElementById("lista-categorias");
  if (!selectTipo || !listaCategorias) return;

  listaCategorias.innerHTML = categoriasDisponiveis
    .map(
      (categoria) =>
        `<option value="${escaparHtml(categoria.tipo_produto)}"></option>`,
    )
    .join("");
}

function configurarCategoriaPorTipo() {
  document
    .getElementById("prod-tipo")
    ?.addEventListener("change", atualizarCategoriasPorTipo);
  atualizarCategoriasPorTipo();
}

function configurarFormularioProduto() {
  const formulario = document.getElementById("formProdutoCompleto");

  if (!formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const arquivoFoto = document.getElementById("file-img")?.files?.[0];
    if (arquivoFoto) {
      const tiposAceitos = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "image/bmp",
        "image/avif",
      ];
      if (!tiposAceitos.includes(arquivoFoto.type)) {
        mostrarAviso(
          "Formato de imagem não aceito. Escolha PNG, JPG, JPEG, WEBP, GIF, BMP ou AVIF.",
        );
        return;
      }
      if (arquivoFoto.size > 10 * 1024 * 1024) {
        mostrarAviso("A imagem deve ter no máximo 10 MB.", "aviso");
        return;
      }
    }
    const fotoBase64 = arquivoFoto
      ? await converterArquivoParaBase64(arquivoFoto)
      : null;
    const categoriaDigitada = document
      .getElementById("prod-categoria")
      .value.trim();
    const categoriaExistente = categoriasDisponiveis.find(
      (categoria) =>
        String(categoria.tipo_produto).trim().toLowerCase() ===
        categoriaDigitada.toLowerCase(),
    );
    const payload = {
      nome: document.getElementById("prod-nome").value.trim(),
      descricao:
        document.getElementById("prod-descricao")?.value.trim() || null,
      tipo_item: document.getElementById("prod-tipo")?.value || "PECA",
      quantidade: Number(document.getElementById("prod-qtd").value),
      estoque_minimo: Number(
        document.getElementById("prod-estoque-minimo")?.value || 0,
      ),
      categoria: categoriaDigitada,
      id_categoria: categoriaExistente
        ? Number(categoriaExistente.id_categoria)
        : null,
      id_fornecedor: Number(document.getElementById("prod-fornecedor").value),
      chassi: document.getElementById("prod-chassi")?.value.trim() || null,
      placa: document.getElementById("prod-placa")?.value.trim() || null,
      ano: document.getElementById("prod-ano")?.value
        ? Number(document.getElementById("prod-ano").value)
        : null,
      fotoBase64,
      status: true,
    };

    const categoriaSelecionada = categoriaExistente;
    if (
      !payload.categoria ||
      (categoriaSelecionada &&
        !categoriaPertenceAoTipo(categoriaSelecionada, payload.tipo_item))
    ) {
      mostrarAviso(
        "Digite uma categoria válida e compatível com o tipo escolhido.",
        "aviso",
      );
      return;
    }

    if (!payload.nome || payload.quantidade < 0 || payload.estoque_minimo < 0) {
      mostrarAviso("Preencha o nome e informe quantidades válidas.", "aviso");
      return;
    }

    const botao = formulario.querySelector('button[type="submit"]');
    const textoOriginal = botao ? botao.innerHTML : "";

    try {
      if (botao) {
        botao.disabled = true;
        botao.innerHTML = "Salvando...";
      }

      const resposta = await fetchAutenticado("/produto", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resposta) return;

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Erro ao salvar produto.");
      }

      mostrarAviso("Produto cadastrado com sucesso!", "sucesso");
      window.location.href = "inventario.html";
    } catch (erro) {
      console.error("Erro ao salvar produto:", erro);
      mostrarAviso(erro.message || "Erro ao salvar produto.");
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.innerHTML = textoOriginal;
      }
    }
  });
}

function escaparHtml(valor) {
  return String(valor ?? "").replace(
    /[&<>'"]/g,
    (caractere) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        caractere
      ],
  );
}

function converterArquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () =>
      reject(new Error("Não foi possível ler a imagem selecionada."));
    leitor.readAsDataURL(arquivo);
  });
}
