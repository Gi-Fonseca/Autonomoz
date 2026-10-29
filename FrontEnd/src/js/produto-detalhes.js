document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id || !/^\d+$/.test(id)) return mostrarErro("Produto inválido.");
  try {
    const resposta = await fetchAutenticado(`/produto/${id}`);
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(
        resultado.mensagem || "Não foi possível carregar o produto.",
      );
    const produto = resultado.dados;
    if (!produto) throw new Error("Produto não encontrado.");
    preencherProduto(produto);
  } catch (erro) {
    mostrarErro(erro.message);
  }
});

function preencherProduto(produto) {
  document.getElementById("carregando-detalhes").classList.add("d-none");
  document.getElementById("card-detalhes").classList.remove("d-none");
  const texto = (id, valor) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor ?? "-";
  };
  const foto = document.getElementById("produto-foto");
  if (foto)
    foto.innerHTML = produto.foto
      ? `<img src="/uploads/${encodeURIComponent(produto.foto)}" alt="Foto de ${escapar(produto.nome)}" style="max-width:100%;max-height:280px;object-fit:contain;border-radius:10px;">`
      : "Sem foto cadastrada";
  texto(
    "produto-tipo",
    String(produto.tipo_item || "PECA").toUpperCase() === "VEICULO"
      ? "VEÍCULO"
      : "PEÇA",
  );
  texto("produto-nome", produto.nome);
  texto("produto-sku", `AMZ-${produto.id_produto}`);
  texto("produto-descricao", produto.descricao || "Sem descrição cadastrada.");
  texto("produto-categoria", produto.tipo_produto || "-");
  texto("produto-fornecedor", produto.fornecedor_nome || "-");
  texto("produto-quantidade", produto.quantidade ?? 0);
  texto("produto-minimo", produto.estoque_minimo ?? 0);
  texto("produto-status", produto.status ? "Ativo" : "Inativo");
  texto("produto-validade", produto.validade || "-");
  texto("produto-placa", produto.placa || "-");
  texto("produto-chassi", produto.chassi || "-");
  texto("produto-ano", produto.ano || "-");
}

function mostrarErro(mensagem) {
  document.getElementById("carregando-detalhes").classList.add("d-none");
  const elemento = document.getElementById("mensagem-detalhes");
  elemento.textContent = mensagem;
  elemento.className = "alert alert-danger";
}

function escapar(valor) {
  return String(valor || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
