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
        alert(
          "Formato de imagem não aceito. Escolha PNG, JPG, JPEG, WEBP, GIF, BMP ou AVIF.",
        );
        return;
      }
      if (arquivoFoto.size > 10 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 10 MB.");
        return;
      }
    }
    const fotoBase64 = arquivoFoto
      ? await converterArquivoParaBase64(arquivoFoto)
      : null;
    const payload = {
      nome: document.getElementById("prod-nome").value.trim(),
      descricao:
        document.getElementById("prod-descricao")?.value.trim() || null,
      tipo_item: document.getElementById("prod-tipo")?.value || "PECA",
      quantidade: Number(document.getElementById("prod-qtd").value),
      estoque_minimo: Number(
        document.getElementById("prod-estoque-minimo")?.value || 0,
      ),
      id_categoria: Number(document.getElementById("prod-categoria").value),
      id_fornecedor: Number(document.getElementById("prod-fornecedor").value),
      chassi: document.getElementById("prod-chassi")?.value.trim() || null,
      placa: document.getElementById("prod-placa")?.value.trim() || null,
      ano: document.getElementById("prod-ano")?.value
        ? Number(document.getElementById("prod-ano").value)
        : null,
      fotoBase64,
      status: true,
    };

    if (!payload.nome || payload.quantidade < 0 || payload.estoque_minimo < 0) {
      alert("Preencha o nome e informe quantidades válidas.");
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

function converterArquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () =>
      reject(new Error("Não foi possível ler a imagem selecionada."));
    leitor.readAsDataURL(arquivo);
  });
}
