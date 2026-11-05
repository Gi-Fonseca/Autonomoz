document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  carregarInventario();
});

async function lerResposta(resposta) {
  let resultado = await resposta.json();
  if (!resposta.ok || resultado.sucesso === false) {
    throw new Error(resultado.mensagem || "Erro ao consultar a API.");
  }

  for (let nivel = 0; nivel < 4; nivel += 1) {
    if (Array.isArray(resultado)) return resultado;
    if (!resultado || typeof resultado !== "object") return resultado;
    if (resultado.sucesso === false) {
      throw new Error(resultado.mensagem || "Erro ao consultar a API.");
    }

    const proximo = [
      resultado.dados,
      resultado.data,
      resultado.produtos,
      resultado.movimentacoes,
      resultado.rows,
    ].find((valor) => valor !== undefined && valor !== null);
    if (proximo === undefined) return resultado;
    resultado = proximo;
  }

  return resultado;
}

async function carregarInventario() {
  const tbody = document.getElementById("tabela-inventario");
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="9" class="text-center py-4 text-muted"><div class="spinner-border text-danger spinner-border-sm me-2" role="status"></div>Carregando inventário do servidor...</td></tr>';
  try {
    const [respostaProdutos, respostaMovimentacoes] = await Promise.all([
      apiFetch("/produto?limit=5000"),
      apiFetch("/movimentacao"),
    ]);
    if (!respostaProdutos || !respostaMovimentacoes) return;
    const produtos = await lerResposta(respostaProdutos);
    const resultadoMovimentacoes = await lerResposta(respostaMovimentacoes);
    const lista = Array.isArray(produtos) ? produtos : [];
    const movimentacoes = Array.isArray(resultadoMovimentacoes)
      ? resultadoMovimentacoes
      : [];
    atualizarMetricas(lista, movimentacoes);
    renderizarTabela(lista);
  } catch (erro) {
    console.error("Erro ao carregar inventário:", erro);
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger fw-bold">Não foi possível carregar o inventário: ${escaparHtml(erro.message)}</td></tr>`;
  }
}

function atualizarMetricas(produtos, movimentacoes = []) {
  const totalUnidades = produtos.reduce(
    (soma, item) => soma + Number(item.quantidade || 0),
    0,
  );
  const criticos = produtos.filter(
    (item) => Number(item.quantidade || 0) <= Number(item.estoque_minimo || 0),
  ).length;
  const totalItens = document.getElementById("total-itens");
  const estoqueCritico = document.getElementById("estoque-critico");
  const valorEstoque = document.getElementById("valor-estoque");
  const giroInventario = document.getElementById("giro-inventario");
  const totalSaidas = movimentacoes
    .filter(
      (movimentacao) =>
        String(movimentacao.tipo || "").toUpperCase() === "SAIDA",
    )
    .reduce(
      (total, movimentacao) => total + Number(movimentacao.quantidade || 0),
      0,
    );
  const indiceSaidas = totalUnidades > 0 ? totalSaidas / totalUnidades : 0;
  if (totalItens) totalItens.textContent = produtos.length;
  if (estoqueCritico)
    estoqueCritico.innerHTML = `${criticos} <small class="text-muted fs-6">SKUs</small>`;
  if (valorEstoque) valorEstoque.textContent = `${totalUnidades} unidades`;
  if (giroInventario)
    giroInventario.textContent = `${indiceSaidas.toFixed(1).replace(".", ",")}x`;
}

function renderizarTabela(produtos) {
  const tbody = document.getElementById("tabela-inventario");
  if (!tbody) {
    throw new Error(
      "O inventario.html não possui o elemento com id tabela-inventario. Substitua também o HTML do inventário.",
    );
  }
  tbody.innerHTML = "";
  if (!produtos.length) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center py-4 text-muted">Nenhum produto cadastrado no banco de dados.</td></tr>';
    return;
  }
  window.produtosInventario = produtos;
  produtos.forEach((produto) => {
    const id = produto.id_produto ?? produto.id;
    const categoria =
      String(produto.tipo_item || "").toUpperCase() === "VEICULO"
        ? '<span class="badge bg-primary text-white">VEÍCULO</span>'
        : '<span class="badge bg-secondary text-white">PEÇA</span>';
    const alertaEstoque =
      String(produto.tipo_item || "").toUpperCase() === "PECA" &&
      Number(produto.quantidade || 0) < 3;
    const classeNome = alertaEstoque ? "text-danger" : "text-dark";
    const foto = produto.foto
      ? `<img src="/uploads/${encodeURIComponent(produto.foto)}" alt="Foto de ${escaparHtml(produto.nome)}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
      : '<span class="text-muted small">Sem foto</span>';
    tbody.innerHTML += `<tr>
      <td class="ps-3">${foto}</td>
      <td class="fw-bold text-muted small">AMZ-${id}</td>
      <td><button type="button" class="btn btn-link p-0 fw-bold ${classeNome} text-decoration-none" onclick="mostrarDetalhesProduto(${id})">${escaparHtml(produto.nome || "-")}</button></td>
      <td>${categoria}</td>
      <td class="fw-semibold text-secondary">${escaparHtml(produto.fornecedor_nome || "-")}</td>
      <td class="small text-muted">${escaparHtml(produto.descricao || produto.placa || "-")}</td>
      <td class="fw-bold text-dark">${produto.quantidade ?? 0}</td>
      <td class="text-end pe-3"><div class="btn-group btn-group-sm">
        <button class="btn btn-outline-success fw-bold" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'ENTRADA')">+ Entrada</button>
        <button class="btn btn-outline-danger fw-bold" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'SAIDA')">- Saída</button>
        <button class="btn btn-outline-secondary fw-bold" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'AJUSTE')">Ajuste</button>
      </div></td>
    </tr>`;
  });
}

function abrirDetalhesProduto(id) {
  const produto = (window.produtosInventario || []).find(
    (item) => Number(item.id_produto ?? item.id) === Number(id),
  );
  if (!produto) return;
  const preencher = (seletor, valor) => {
    const elemento = document.querySelector(seletor);
    if (elemento) elemento.textContent = valor ?? "-";
  };
  const foto = document.getElementById("detalhe-foto");
  if (foto) {
    foto.innerHTML = produto.foto
      ? `<img src="/uploads/${encodeURIComponent(produto.foto)}" alt="Foto de ${escaparHtml(produto.nome)}" style="max-width:100%;max-height:220px;object-fit:contain;border-radius:10px;">`
      : "Sem foto cadastrada";
  }
  preencher("#detalhe-nome", produto.nome);
  preencher("#detalhe-sku", `AMZ-${produto.id_produto ?? produto.id}`);
  preencher(
    "#detalhe-descricao",
    produto.descricao || "Sem descrição cadastrada.",
  );
  preencher(
    "#detalhe-tipo",
    produto.tipo_item === "VEICULO" ? "Veículo" : "Peça",
  );
  preencher(
    "#detalhe-categoria",
    produto.tipo_produto || produto.categoria || "-",
  );
  preencher("#detalhe-fornecedor", produto.fornecedor_nome || "-");
  preencher("#detalhe-quantidade", produto.quantidade ?? 0);
  preencher("#detalhe-minimo", produto.estoque_minimo ?? 0);
  preencher("#detalhe-status", produto.status ? "Ativo" : "Inativo");
  preencher("#detalhe-placa", produto.placa || "-");
  preencher("#detalhe-chassi", produto.chassi || "-");
  preencher("#detalhe-ano", produto.ano || "-");
  const modal = document.getElementById("modalDetalhesProduto");
  if (!modal) return;
  if (window.bootstrap?.Modal) {
    bootstrap.Modal.getOrCreateInstance(modal).show();
  } else {
    modal.style.display = "block";
    modal.classList.add("show");
    modal.removeAttribute("aria-hidden");
    document.body.classList.add("modal-open");
    const fechar = () => {
      modal.style.display = "none";
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };
    modal
      .querySelectorAll("[data-bs-dismiss='modal'], .btn-close")
      .forEach((botao) => (botao.onclick = fechar));
  }
}

function mostrarDetalhesProduto(id) {
  const produto = (window.produtosInventario || []).find(
    (item) => Number(item.id_produto ?? item.id) === Number(id),
  );
  const painel = document.getElementById("detalhe-produto-inline");
  if (!produto || !painel) return;
  const preencher = (idElemento, valor) => {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.textContent = valor ?? "-";
  };
  const foto = document.getElementById("inline-produto-foto");
  if (foto)
    foto.innerHTML = produto.foto
      ? `<img src="/uploads/${encodeURIComponent(produto.foto)}" alt="Foto de ${escaparHtml(produto.nome)}" style="max-width:100%;max-height:180px;object-fit:contain;border-radius:10px;">`
      : "Sem foto cadastrada";
  preencher("inline-produto-nome", produto.nome);
  preencher(
    "inline-produto-descricao",
    produto.descricao || "Sem descrição cadastrada.",
  );
  preencher(
    "inline-produto-tipo",
    String(produto.tipo_item || "PECA").toUpperCase() === "VEICULO"
      ? "Veículo"
      : "Peça",
  );
  preencher("inline-produto-categoria", produto.tipo_produto || "-");
  preencher("inline-produto-fornecedor", produto.fornecedor_nome || "-");
  preencher("inline-produto-quantidade", produto.quantidade ?? 0);
  preencher("inline-produto-minimo", produto.estoque_minimo ?? 0);
  preencher("inline-produto-status", produto.status ? "Ativo" : "Inativo");
  preencher("inline-produto-placa", produto.placa || "-");
  preencher("inline-produto-chassi", produto.chassi || "-");
  preencher("inline-produto-ano", produto.ano || "-");
  painel.classList.remove("d-none");
  painel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fecharDetalhesProduto() {
  document.getElementById("detalhe-produto-inline")?.classList.add("d-none");
}

function escaparTexto(valor) {
  return String(valor || "").replace(/[\\']/g, "\\$&");
}
function escaparHtml(valor) {
  return String(valor || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function abrirModalMov(id, nome, tipo) {
  document.getElementById("mov-produto-id").value = id;
  document.getElementById("mov-produto-nome").value = nome;
  document.getElementById("mov-tipo").value = tipo;
  document.getElementById("mov-qtd").value = 1;
  document.getElementById("mov-obs").value = "";
  new bootstrap.Modal(document.getElementById("modalMovimentacao")).show();
}

async function confirmarMovimentacao() {
  const produtoId = document.getElementById("mov-produto-id").value;
  const tipo = document.getElementById("mov-tipo").value;
  const quantidade = Number(document.getElementById("mov-qtd").value);
  const campoMotivo = document.getElementById("mov-obs");
  const observacao = campoMotivo.value.trim();
  if (!quantidade || quantidade <= 0)
    return mostrarAviso("Informe uma quantidade válida.", "aviso");
  if (!observacao) {
    mostrarAviso("O motivo da movimentação é obrigatório.", "aviso");
    campoMotivo.focus();
    return;
  }
  if (observacao.length > 255) {
    mostrarAviso("O motivo deve ter no máximo 255 caracteres.", "aviso");
    campoMotivo.focus();
    return;
  }
  const payload = {
    id_produto: Number(produtoId),
    quantidade,
    motivo_ajuste: observacao,
    motivo_saida: observacao,
    valor_compra: 0,
  };
  const rota = { ENTRADA: "/entrada", SAIDA: "/saida", AJUSTE: "/ajuste" }[
    tipo
  ];
  try {
    const resposta = await apiFetch(rota, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(
        resultado.mensagem || "Não foi possível registrar a movimentação.",
      );
    mostrarAviso("Movimentação registrada com sucesso.", "sucesso");
    bootstrap.Modal.getInstance(
      document.getElementById("modalMovimentacao"),
    )?.hide();
    carregarInventario();
  } catch (erro) {
    console.error("Erro ao registrar movimentação:", erro);
    mostrarAviso(`Erro ao registrar movimentação: ${erro.message}`);
  }
}

function filtrarInventario() {
  const termo = document.getElementById("busca-inventario").value.toLowerCase();
  document.querySelectorAll("#tabela-inventario tr").forEach((linha) => {
    linha.style.display = linha.innerText.toLowerCase().includes(termo)
      ? ""
      : "none";
  });
}
