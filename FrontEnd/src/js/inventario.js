document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  configurarAcessibilidadeModalMovimentacao();
  carregarInventario();
  document
    .getElementById("mov-tipo")
    ?.addEventListener("change", () => {
      configurarQuantidadeMovimentacao();
      configurarClienteMovimentacao();
    });
  document
    .getElementById("mov-finalidade")
    ?.addEventListener("change", configurarClienteMovimentacao);
});

function configurarClienteMovimentacao() {
  const bloco = document.getElementById("mov-cliente-bloco");
  const valorBloco = document.getElementById("mov-valor-venda-bloco");
  const finalidadeBloco = document.getElementById("mov-finalidade-bloco");
  const select = document.getElementById("mov-tipo");
  const finalidade = document.getElementById("mov-finalidade");
  const clienteNome = document.getElementById("mov-cliente-nome");
  const clienteCnpj = document.getElementById("mov-cliente-cnpj");
  const valorVenda = document.getElementById("mov-valor-venda");
  if (!bloco || !valorBloco || !finalidadeBloco || !select || !finalidade || !clienteNome || !clienteCnpj || !valorVenda) return;
  const eSaida = select.value === "SAIDA";
  const eVenda = eSaida && finalidade.value === "VENDA";
  finalidadeBloco.classList.toggle("d-none", !eSaida);
  bloco.classList.toggle("d-none", !eVenda);
  valorBloco.classList.toggle("d-none", !eVenda);
  clienteNome.required = eVenda;
  clienteCnpj.required = eVenda;
  valorVenda.required = eVenda;
  if (!eVenda) {
    clienteNome.value = "";
    clienteCnpj.value = "";
    valorVenda.value = "";
  }
}

function configurarAcessibilidadeModalMovimentacao() {
  const modal = document.getElementById("modalMovimentacao");
  if (!modal) return;
  let disparador = null;

  modal.addEventListener("show.bs.modal", () => {
    disparador = document.activeElement;
  });
  modal.addEventListener("hide.bs.modal", () => {
    if (modal.contains(document.activeElement)) document.activeElement.blur();
  });
  modal.addEventListener("hidden.bs.modal", () => {
    if (disparador?.isConnected) disparador.focus({ preventScroll: true });
  });
}

function normalizarValorProduto(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  const texto = String(valor).trim().replace(/\s/g, "");
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

function formatarValorProduto(valor) {
  const numero = normalizarValorProduto(valor);
  return numero === null
    ? ""
    : numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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
    const [respostaProdutos, respostaSaidas] = await Promise.all([
      apiFetch("/produto?limit=5000"),
      apiFetch("/saida"),
    ]);
    if (!respostaProdutos || !respostaSaidas) return;
    const produtos = await lerResposta(respostaProdutos);
    const resultadoSaidas = await lerResposta(respostaSaidas);
    const lista = Array.isArray(produtos) ? produtos : [];
    const saidas = Array.isArray(resultadoSaidas)
      ? resultadoSaidas
      : [];
    atualizarMetricas(lista, saidas);
    renderizarTabela(lista);
  } catch (erro) {
    console.error("Erro ao carregar inventário:", erro);
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger fw-bold">Não foi possível carregar o inventário: ${escaparHtml(erro.message)}</td></tr>`;
  }
}

function atualizarMetricas(produtos, saidas = []) {
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
  const saidasPeriodo = document.getElementById("saidas-periodo");
  const agora = Date.now();
  const inicioPeriodo = agora - 30 * 24 * 60 * 60 * 1000;
  const totalSaidas30Dias = saidas.reduce((total, saida) => {
    const dataSaida = converterDataSaida(saida.data_saida || saida.data_movimentacao);
    const instante = dataSaida?.getTime();
    if (!Number.isFinite(instante) || instante < inicioPeriodo || instante > agora) {
      return total;
    }
    return total + Number(saida.quantidade || 0);
  }, 0);
  const indiceSaidas = totalUnidades > 0 ? totalSaidas30Dias / totalUnidades : 0;
  if (totalItens) totalItens.textContent = produtos.length;
  if (estoqueCritico)
    estoqueCritico.innerHTML = `${criticos} <small class="text-muted fs-6">SKUs</small>`;
  if (valorEstoque) valorEstoque.textContent = `${totalUnidades} unidades`;
  if (giroInventario)
    giroInventario.textContent = `${indiceSaidas.toFixed(2).replace(".", ",")}x`;
  if (saidasPeriodo)
    saidasPeriodo.textContent = `${totalSaidas30Dias} ${totalSaidas30Dias === 1 ? "unidade saiu" : "unidades saíram"} nos últimos 30 dias`;
}

function converterDataSaida(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  if (typeof valor === "string") {
    const mysql = valor.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
    );
    if (mysql) {
      return new Date(
        Number(mysql[1]),
        Number(mysql[2]) - 1,
        Number(mysql[3]),
        Number(mysql[4] || 0),
        Number(mysql[5] || 0),
        Number(mysql[6] || 0),
      );
    }
  }
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
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
      ? `<img src="/uploads/${encodeURIComponent(produto.foto)}?v=${encodeURIComponent(produto.foto)}" alt="Foto de ${escaparHtml(produto.nome)}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
      : '<span class="text-muted small">Sem foto</span>';
    tbody.innerHTML += `<tr>
      <td class="ps-3">${foto}</td>
      <td class="fw-bold text-muted small">AMZ-${id}</td>
      <td><button type="button" class="btn btn-link p-0 fw-bold ${classeNome} text-decoration-none" onclick="mostrarDetalhesProduto(${id})">${escaparHtml(produto.nome || "-")}</button></td>
      <td>${categoria}</td>
      <td class="fw-semibold text-secondary">${escaparHtml(produto.fornecedor_nome || "-")}</td>
      <td class="small text-muted">${escaparHtml(produto.descricao || produto.placa || "-")}</td>
      <td class="fw-bold text-dark">${produto.quantidade ?? 0}</td>
      <td class="text-end pe-3"><div class="acoes-inventario">
        <button class="btn btn-sm btn-acao-estoque btn-acao-entrada" title="Registrar entrada no estoque" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'ENTRADA')"><i class="bi bi-box-arrow-in-down me-1"></i>Entrada</button>
        <button class="btn btn-sm btn-acao-estoque btn-acao-saida" title="Registrar saída do estoque" onclick="abrirModalMov(${id}, '${escaparTexto(produto.nome)}', 'SAIDA')"><i class="bi bi-box-arrow-up-right me-1"></i>Saída</button>
        <button class="btn btn-sm btn-acao-estoque btn-acao-ajustes" title="Ajustar cadastro completo deste produto" onclick="abrirAjusteCadastro(${id})"><i class="bi bi-sliders me-1"></i>Ajustes</button>
      </div></td>
    </tr>`;
  });
}

function abrirAjusteCadastro(id) {
  window.location.href = `produto-cadas.html?ajuste=${encodeURIComponent(id)}`;
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
  preencher("#detalhe-preco-custo", formatarMoeda(produto.preco_custo));
  preencher("#detalhe-preco-venda", formatarMoeda(produto.preco_venda));
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
  preencher("inline-produto-preco-custo", formatarMoeda(produto.preco_custo));
  preencher("inline-produto-preco-venda", formatarMoeda(produto.preco_venda));
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
  document.getElementById("mov-finalidade").value = "NAO_VENDA";
  document.getElementById("mov-cliente-nome").value = "";
  document.getElementById("mov-cliente-cnpj").value = "";
  const produto = (window.produtosInventario || []).find(
    (item) => Number(item.id_produto ?? item.id) === Number(id),
  );
  const precoVenda = normalizarValorProduto(produto?.preco_venda);
  const campoValorVenda = document.getElementById("mov-valor-venda");
  campoValorVenda.value = precoVenda === null ? "" : String(precoVenda);
  campoValorVenda.dataset.valorNumerico = precoVenda === null ? "" : String(precoVenda);
  configurarClienteMovimentacao();
  document.getElementById("mov-qtd").value = 1;
  document.getElementById("mov-obs").value = "";
  configurarQuantidadeMovimentacao();
  new bootstrap.Modal(document.getElementById("modalMovimentacao")).show();
}

function configurarQuantidadeMovimentacao() {
  const tipo = document.getElementById("mov-tipo")?.value;
  const quantidade = document.getElementById("mov-qtd");
  const ajuda = document.getElementById("mov-qtd-ajuda");
  if (!quantidade) return;
  if (tipo === "AJUSTE") {
    quantidade.removeAttribute("min");
    if (ajuda) {
      ajuda.textContent = "Use positivo para adicionar e negativo para retirar do estoque.";
      ajuda.classList.remove("d-none");
    }
  } else {
    quantidade.min = "1";
    if (Number(quantidade.value) <= 0) quantidade.value = "1";
    if (ajuda) ajuda.classList.add("d-none");
  }
}

async function confirmarMovimentacao() {
  const produtoId = document.getElementById("mov-produto-id").value;
  const tipo = document.getElementById("mov-tipo").value;
  const quantidade = Number(document.getElementById("mov-qtd").value);
  const finalidade = document.getElementById("mov-finalidade")?.value;
  const eVenda = tipo === "SAIDA" && finalidade === "VENDA";
  const clienteNome = document.getElementById("mov-cliente-nome")?.value.trim();
  const clienteCnpj = document.getElementById("mov-cliente-cnpj")?.value.trim();
  const valorVendaCampo = document.getElementById("mov-valor-venda");
  const valorVenda = normalizarValorProduto(valorVendaCampo?.value);
  const campoMotivo = document.getElementById("mov-obs");
  const observacao = campoMotivo.value.trim();
  if (
    !Number.isInteger(quantidade) ||
    (tipo === "AJUSTE" ? quantidade === 0 : quantidade <= 0)
  )
    return mostrarAviso("Informe uma quantidade válida.", "aviso");
  if (!observacao && tipo !== "SAIDA") {
    mostrarAviso("O motivo da movimentação é obrigatório.", "aviso");
    campoMotivo.focus();
    return;
  }
  if (observacao.length > 255) {
    mostrarAviso("O motivo deve ter no máximo 255 caracteres.", "aviso");
    campoMotivo.focus();
    return;
  }
  if (eVenda && (!clienteNome || !clienteCnpj)) {
    mostrarAviso("Informe o nome e o CNPJ do cliente da venda.", "aviso");
    document.getElementById(!clienteNome ? "mov-cliente-nome" : "mov-cliente-cnpj")?.focus();
    return;
  }
  if (eVenda && (valorVenda === null || !Number.isFinite(valorVenda) || valorVenda < 0)) {
    mostrarAviso("Informe um preço de venda válido.", "aviso");
    valorVendaCampo?.focus();
    return;
  }
  const payload = {
    id_produto: Number(produtoId),
    quantidade,
    valor_compra: 0,
    finalidade,
  };
  if (eVenda && clienteNome && clienteCnpj) {
    payload.cliente = `${clienteNome} — CNPJ ${clienteCnpj}`;
    payload.cliente_nome = clienteNome;
    payload.cliente_cnpj = clienteCnpj;
    payload.valor_venda = valorVenda;
  }
  const campoMotivoPorTipo = {
    ENTRADA: "motivo_entrada",
    SAIDA: "motivo_saida",
    AJUSTE: "motivo_ajuste",
  }[tipo];
  if (observacao) payload[campoMotivoPorTipo] = observacao;
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
