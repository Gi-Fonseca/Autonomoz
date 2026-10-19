document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  await carregarSelects();
  configurarFormularioProduto();
});

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
        selectCategoria.innerHTML = categorias
          .map(
            (categoria) =>
              `<option value="${categoria.id_categoria}">${categoria.tipo_produto}</option>`,
          )
          .join("");
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

function configurarFormularioProduto() {
  const formulario = document.getElementById("formProdutoCompleto");

  if (!formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const payload = {
      nome: document.getElementById("prod-nome").value.trim(),
      quantidade: Number(document.getElementById("prod-qtd").value),
      id_categoria: Number(document.getElementById("prod-categoria").value),
      id_fornecedor: Number(document.getElementById("prod-fornecedor").value),
      status: true,
    };

    if (!payload.nome || !payload.quantidade || payload.quantidade < 0) {
      alert("Preencha o nome e uma quantidade válida.");
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

      alert("Produto cadastrado com sucesso!");
      window.location.href = "inventario.html";
    } catch (erro) {
      console.error("Erro ao salvar produto:", erro);
      alert(erro.message || "Erro ao salvar produto.");
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.innerHTML = textoOriginal;
      }
    }
  });
}
