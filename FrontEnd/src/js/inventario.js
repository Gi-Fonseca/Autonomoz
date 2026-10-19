document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  carregarInventario();
});

async function lerResposta(resposta) {
  const resultado = await resposta.json();

  if (!resposta.ok || resultado.sucesso === false) {
    throw new Error(resultado.mensagem || "Erro ao consultar a API.");
  }

  // O backend normaliza as respostas no formato { sucesso, dados }.
  return resultado.dados !== undefined ? resultado.dados : resultado;
}

async function carregarInventario() {
  const tbody = document.getElementById("tabela-inventario");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-4 text-muted">
        <div class="spinner-border text-danger spinner-border-sm me-2" role="status"></div>
        Carregando inventário do servidor...
      </td>
    </tr>
  `;

  try {
    const resposta = await apiFetch("/produto");
    if (!resposta) return;

    const produtos = await lerResposta(resposta);
    renderizarTabela(Array.isArray(produtos) ? produtos : []);
  } catch (erro) {
    console.error("Erro ao carregar inventário:", erro);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-danger fw-bold">
          Não foi possível carregar o inventário. Verifique o backend e o banco de dados.
        </td>
      </tr>
    `;
  }
}

function renderizarTabela(produtos) {
  const tbody = document.getElementById("tabela-inventario");
  tbody.innerHTML = "";

  if (!produtos.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-muted">
          Nenhum produto cadastrado no banco de dados.
        </td>
      </tr>
    `;
    return;
  }

  produtos.forEach((produto) => {
    const id = produto.id_produto ?? produto.id;
    const preco = formatarMoeda(produto.preco_venda ?? produto.preco ?? 0);
    const categoria = produto.id_categoria == 2
      ? '<span class="badge bg-primary text-white">VEÍCULO</span>'
      : '<span class="badge bg-secondary text-white">PEÇA</span>';

    tbody.innerHTML += `
      <tr>
        <td class="ps-3 fw-bold text-muted small">AMZ-${id}</td>
        <td class="fw-bold text-dark">${produto.nome || "-"}</td>
        <td>${categoria}</td>
        <td class="fw-semibold text-secondary">${produto.marca || "Genérica"}</td>
        <td class="small text-muted">${produto.modelo || "Multimodelos"}</td>
        <td class="fw-bold text-dark">${preco}</td>
        <td>
          <span class="badge bg-light text-dark border px-2 py-1 fs-6">
            ${produto.quantidade ?? 0}
          </span>
        </td>
        <td class="text-end pe-3">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success fw-bold" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'ENTRADA')">+ Entrada</button>
            <button class="btn btn-outline-danger fw-bold" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'SAIDA')">- Saída</button>
            <button class="btn btn-outline-secondary fw-bold" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'AJUSTE')">Ajuste</button>
          </div>
        </td>
      </tr>
    `;
  });
}

function escaparTexto(valor) {
  return String(valor || "").replace(/['\\]/g, "\\$&");
}

function abrirModalMov(id, nome, tipo) {
  document.getElementById("mov-produto-id").value = id;
  document.getElementById("mov-produto-nome").value = nome;
  document.getElementById("mov-tipo").value = tipo;

  const modal = new bootstrap.Modal(document.getElementById("modalMovimentacao"));
  modal.show();
}

async function confirmarMovimentacao() {
  const produtoId = document.getElementById("mov-produto-id").value;
  const tipo = document.getElementById("mov-tipo").value;
  const quantidade = Number(document.getElementById("mov-qtd").value);
  const observacao = document.getElementById("mov-obs").value.trim();

  if (!quantidade || quantidade <= 0) {
    alert("Informe uma quantidade válida.");
    return;
  }

  // A API atual possui rotas separadas para entrada, saída e ajuste.
  const rotaPorTipo = {
    ENTRADA: "/entrada",
    SAIDA: "/saida",
    AJUSTE: "/ajuste",
  };

  const payload = {
    id_produto: Number(produtoId),
    quantidade,
    motivo_ajuste: observacao || "Movimentação manual via painel",
    motivo_saida: observacao || "Movimentação manual via painel",
  };

  try {
    const resposta = await apiFetch(rotaPorTipo[tipo], {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resposta) return;

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(resultado.mensagem || "Não foi possível registrar a movimentação.");
    }

    alert("Movimentação registrada com sucesso.");
    bootstrap.Modal.getInstance(document.getElementById("modalMovimentacao"))?.hide();
    carregarInventario();
  } catch (erro) {
    console.error("Erro ao registrar movimentação:", erro);
    alert(`Erro ao registrar movimentação: ${erro.message}`);
  }
}

function filtrarInventario() {
  const termo = document.getElementById("busca-inventario").value.toLowerCase();
  const linhas = document.querySelectorAll("#tabela-inventario tr");

  linhas.forEach((linha) => {
    linha.style.display = linha.innerText.toLowerCase().includes(termo)
      ? ""
      : "none";
  });
}
