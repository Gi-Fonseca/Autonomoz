let relatorioAtual = null;
let tipoRelatorioAtual = "estoque";

function nomeClienteRelatorio(item) {
  const texto = String(item.cliente_nome || item.cliente || "").trim();
  return texto.split(/\s+—\s+CNPJ\s+/i)[0] || "Não venda";
}

function cnpjClienteRelatorio(item) {
  if (item.cliente_cnpj) return item.cliente_cnpj;
  const encontrado = String(item.cliente || "").match(/CNPJ\s+(.+)$/i);
  return encontrado?.[1] || "—";
}

const TIPOS_RELATORIO = {
  estoque: {
    titulo: "Relatório de estoque",
    descricao: "Posição atual dos produtos cadastrados no estoque.",
    rota: "/relatorios/estoque",
    colunas: [
      { titulo: "Produto", valor: (item) => item.nome || "-" },
      {
        titulo: "Tipo",
        valor: (item) =>
          String(item.tipo_item || "").toUpperCase() === "VEICULO" ? "Veículo" : "Peça",
      },
      { titulo: "Categoria", valor: (item) => item.categoria || "-" },
      { titulo: "Fornecedor", valor: (item) => item.fornecedor_nome || "-" },
      { titulo: "Quantidade", valor: (item) => item.quantidade ?? 0 },
      { titulo: "Mínimo", valor: (item) => item.estoque_minimo ?? 0 },
      {
        titulo: "Status",
        valor: (item) => {
          const ativo = item.status === true || Number(item.status) === 1;
          const alerta =
            String(item.tipo_item || "").toUpperCase() === "PECA" &&
            Number(item.quantidade || 0) < 3;
          return !ativo ? "Inativo" : alerta ? "Atenção" : "Regular";
        },
      },
    ],
  },
  movimentacoes: {
    titulo: "Relatório de movimentações",
    descricao: "Histórico completo de entradas, saídas e ajustes registrados.",
    rota: "/relatorios/movimentacoes",
    colunas: [
      { titulo: "Data", valor: (item) => formatarData(item.data_movimentacao) },
      { titulo: "Produto", valor: (item) => item.produto_nome || "-" },
      { titulo: "Tipo", valor: (item) => item.tipo || "-" },
      {
        titulo: "Quantidade",
        valor: (item) => formatarQuantidadeMovimentacao(item.tipo, item.quantidade),
      },
      { titulo: "Responsável", valor: (item) => item.funcionario_nome || "-" },
      { titulo: "Motivo", valor: (item) => item.motivo || "Não informado" },
    ],
  },
  entradas: {
    titulo: "Relatório de entradas",
    descricao: "Recebimentos lançados no estoque, com fornecedor e motivo.",
    rota: "/relatorios/entradas",
    colunas: [
      { titulo: "Data", valor: (item) => formatarData(item.data_movimentacao) },
      { titulo: "Produto", valor: (item) => item.produto_nome || "-" },
      { titulo: "Quantidade", valor: (item) => item.quantidade ?? 0 },
      { titulo: "Fornecedor", valor: (item) => item.fornecedor || "-" },
      { titulo: "Valor de compra", valor: (item) => formatarMoeda(item.valor_compra) },
      { titulo: "Responsável", valor: (item) => item.funcionario_nome || "-" },
      { titulo: "Motivo", valor: (item) => item.motivo || "Não informado" },
    ],
  },
  saidas: {
    titulo: "Relatório de saídas",
    descricao: "Retiradas lançadas no estoque, com cliente e motivo opcional.",
    rota: "/relatorios/saidas",
    colunas: [
      { titulo: "Data", valor: (item) => formatarData(item.data_movimentacao) },
      { titulo: "Produto", valor: (item) => item.produto_nome || "-" },
      { titulo: "Quantidade", valor: (item) => item.quantidade ?? 0 },
      { titulo: "Nome do cliente", valor: nomeClienteRelatorio },
      { titulo: "CNPJ", valor: cnpjClienteRelatorio },
      { titulo: "Valor de venda", valor: (item) => formatarMoeda(item.valor_venda) },
      { titulo: "Responsável", valor: (item) => item.funcionario_nome || "-" },
      { titulo: "Motivo", valor: (item) => item.motivo || "Não informado" },
      { titulo: "Status", valor: (item) => Number(item.cancelada) === 1 ? "Cancelada / estornada" : "Ativa" },
      { titulo: "Ação", html: true, valor: (item) => Number(item.cancelada) === 1 ? "—" : `<button class="btn btn-sm btn-outline-danger" type="button" onclick="abrirModalCancelamento(${Number(item.id)})"><i class="bi bi-arrow-counterclockwise me-1"></i>Estornar</button>` },
    ],
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  const usuario = obterUsuarioLogado();
  const perfil = document.getElementById("perfil-gerencia");
  const cargo = String(usuario?.cargo || "")
    .trim()
    .toUpperCase();
  if (!usuario || cargo !== "GERENTE") {
    if (perfil) perfil.textContent = "Acesso restrito ao Gerente";
    mostrarMensagem(
      "Apenas usuários com cargo Gerente podem acessar relatórios e operações administrativas.",
      "danger",
    );
    return;
  }

  if (perfil) perfil.textContent = `Gerente: ${usuario.nome || "usuário"}`;
  document.getElementById("conteudo-gerencia")?.classList.remove("d-none");
  garantirSeletorRelatorios();
  document.getElementById("btn-atualizar")?.addEventListener("click", () => {
    carregarRelatorio(tipoRelatorioAtual);
  });
  document.getElementById("btn-exportar")?.addEventListener("click", exportarWord);
  document
    .getElementById("btn-exportar-csv")
    ?.addEventListener("click", exportarCsv);
  document
    .getElementById("btn-exportar-excel")
    ?.addEventListener("click", exportarExcel);
  document.getElementById("btn-imprimir")?.addEventListener("click", imprimirRelatorio);
  document.querySelectorAll("[data-tipo-relatorio]").forEach((botao) => {
    botao.addEventListener("click", () => {
      carregarRelatorio(botao.dataset.tipoRelatorio);
    });
  });
  await carregarRelatorio("estoque");
  await carregarFuncionarios();
});

async function carregarFuncionarios() {
  const tabela = document.getElementById("tabela-funcionarios");
  if (!tabela) return;
  try {
    const resposta = await fetchAutenticado("/funcionario");
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) throw new Error(resultado.mensagem || "Não foi possível carregar os perfis.");
    const usuarios = Array.isArray(resultado.dados) ? resultado.dados : [];
    const usuarioAtual = obterUsuarioLogado();
    tabela.innerHTML = usuarios.length ? usuarios.map((usuario) => {
      const proprio = Number(usuario.id) === Number(usuarioAtual?.id);
      const cargo = String(usuario.cargo || "");
      return `<tr><td class="fw-semibold">${escapar(usuario.nome)}</td><td>${escapar(usuario.email)}</td><td><span class="badge ${cargo.toLowerCase() === "gerente" ? "text-bg-danger" : "text-bg-secondary"}">${escapar(cargo)}</span></td><td>${escapar(usuario.cpf || "-")}</td><td class="text-end">${proprio ? '<span class="text-muted small">Usuário atual</span>' : `<button type="button" class="btn btn-sm btn-outline-danger" onclick="abrirExclusaoFuncionario(${Number(usuario.id)}, '${escaparTextoGerencia(usuario.nome)}')"><i class="bi bi-trash me-1"></i>Excluir</button>`}</td></tr>`;
    }).join("") : '<tr><td colspan="5" class="text-center text-muted py-3">Nenhum funcionário cadastrado.</td></tr>';
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-3">${escapar(erro.message || "Erro ao carregar perfis.")}</td></tr>`;
  }
}

function escaparTextoGerencia(valor) {
  return String(valor || "").replace(/[\\']/g, "\\$&");
}

function abrirExclusaoFuncionario(id, nome) {
  let modal = document.getElementById("modal-exclusao-funcionario");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-exclusao-funcionario";
    modal.className = "position-fixed top-0 start-0 w-100 h-100 d-none";
    modal.style.cssText = "z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:1rem";
    modal.innerHTML = `<div class="bg-white rounded-4 shadow p-4" style="width:min(430px,100%)"><h5 class="fw-bold">Excluir usuário?</h5><p id="nome-exclusao-funcionario" class="text-muted"></p><p class="small text-danger">Essa ação remove o acesso ao sistema. Registros históricos desse funcionário serão preservados.</p><div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-light" onclick="fecharExclusaoFuncionario()">Cancelar</button><button type="button" class="btn btn-danger" onclick="confirmarExclusaoFuncionario()">Excluir usuário</button></div></div>`;
    document.body.appendChild(modal);
  }
  modal.dataset.id = String(id);
  document.getElementById("nome-exclusao-funcionario").textContent = `Usuário selecionado: ${nome}`;
  modal.classList.remove("d-none");
}

function fecharExclusaoFuncionario() {
  document.getElementById("modal-exclusao-funcionario")?.classList.add("d-none");
}

async function confirmarExclusaoFuncionario() {
  const modal = document.getElementById("modal-exclusao-funcionario");
  try {
    const resposta = await fetchAutenticado(`/funcionario/${modal.dataset.id}`, { method: "DELETE" });
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) throw new Error(resultado.mensagem || "Não foi possível excluir o usuário.");
    fecharExclusaoFuncionario();
    mostrarMensagem("Usuário excluído com sucesso.", "success");
    await carregarFuncionarios();
  } catch (erro) {
    mostrarMensagem(erro.message || "Não foi possível excluir o usuário.", "danger");
  }
}

async function carregarRelatorio(tipo = tipoRelatorioAtual) {
  const configuracao = TIPOS_RELATORIO[tipo];
  if (!configuracao) return;
  tipoRelatorioAtual = tipo;
  const card = document.getElementById("card-relatorio");
  const botaoAtualizar = document.getElementById("btn-atualizar");
  const titulo =
    document.getElementById("titulo-relatorio") || card?.querySelector("h5");
  const descricao =
    document.getElementById("descricao-relatorio") || card?.querySelector("p");
  const tabela = document.getElementById("tabela-relatorio");
  const cabecalho =
    document.getElementById("cabecalho-relatorio") ||
    card?.querySelector("table thead tr");

  if (titulo) titulo.textContent = configuracao.titulo;
  if (descricao) descricao.textContent = configuracao.descricao;
  atualizarAutorRelatorio();
  atualizarSeletorAtivo(tipo);
  if (cabecalho) {
    cabecalho.innerHTML = configuracao.colunas
      .map((coluna) => `<th>${escapar(coluna.titulo)}</th>`)
      .join("");
  }
  if (tabela) {
    tabela.innerHTML = `<tr><td colspan="${configuracao.colunas.length}" class="text-center py-4 text-muted">Carregando ${escapar(configuracao.titulo.toLowerCase())}...</td></tr>`;
  }
  if (botaoAtualizar) {
    botaoAtualizar.disabled = true;
    botaoAtualizar.innerHTML = "Carregando...";
  }

  try {
    const resposta = await fetchAutenticado(configuracao.rota);
    if (!resposta) return;
    const contentType = resposta.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `A API retornou HTML em vez de JSON (HTTP ${resposta.status}). Reinicie o backend atualizado.`,
      );
    }
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(resultado.mensagem || "Não foi possível gerar o relatório.");
    }

    let dados = resultado.dados;
    if (dados && !Array.isArray(dados.itens) && dados.dados) {
      dados = dados.dados;
    }
    relatorioAtual = {
      tipo,
      geradoEm: dados?.gerado_em || new Date().toISOString(),
      resumo: dados?.resumo || {},
      itens: Array.isArray(dados?.itens) ? dados.itens : [],
    };
    renderizarResumo(tipo, relatorioAtual.resumo, relatorioAtual.itens);
    renderizarTabelaRelatorio(configuracao, relatorioAtual.itens);
    if (tipo === "estoque") atualizarMetricasEstoque(relatorioAtual.itens);
    mostrarMensagem(`${configuracao.titulo} carregado com os dados atuais do banco.`, "success");
  } catch (erro) {
    console.error(`Erro no relatório ${tipo}:`, erro);
    if (tabela) {
      tabela.innerHTML = `<tr><td colspan="${configuracao.colunas.length}" class="text-center py-4 text-danger">Não foi possível carregar este relatório.</td></tr>`;
    }
    mostrarMensagem(erro.message || "Não foi possível carregar o relatório.", "danger");
  } finally {
    if (botaoAtualizar) {
      botaoAtualizar.disabled = false;
      botaoAtualizar.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Atualizar';
    }
  }
}

function obterEmailGerador() {
  const usuario =
    typeof obterUsuarioLogado === "function" ? obterUsuarioLogado() : null;
  return (
    usuario?.email ||
    usuario?.email_funcionario ||
    usuario?.email_usuario ||
    "E-mail não informado"
  );
}

function atualizarAutorRelatorio() {
  let autor = document.getElementById("autor-relatorio");
  if (!autor) {
    const descricao = document.getElementById("descricao-relatorio");
    if (descricao?.parentElement) {
      autor = document.createElement("p");
      autor.id = "autor-relatorio";
      autor.className = "text-muted small mb-0 mt-1";
      descricao.insertAdjacentElement("afterend", autor);
    }
  }
  if (autor) autor.textContent = `Gerado por: ${obterEmailGerador()}`;
}

function atualizarSeletorAtivo(tipoAtivo) {
  document.querySelectorAll("[data-tipo-relatorio]").forEach((botao) => {
    const ativo = botao.dataset.tipoRelatorio === tipoAtivo;
    botao.classList.toggle("btn-danger", ativo);
    botao.classList.toggle("btn-outline-danger", !ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
}

function garantirSeletorRelatorios() {
  const card = document.getElementById("card-relatorio");
  if (!card || card.querySelector("[data-tipo-relatorio]")) return;

  const seletor = document.createElement("div");
  seletor.className = "d-flex flex-wrap gap-2 mb-3";
  seletor.setAttribute("role", "group");
  seletor.setAttribute("aria-label", "Selecionar tipo de relatório");
  const rotulos = {
    estoque: "Estoque",
    movimentacoes: "Movimentações",
    entradas: "Entradas",
    saidas: "Saídas",
  };
  Object.entries(rotulos).forEach(([tipo, rotulo]) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = tipo === tipoRelatorioAtual ? "btn btn-danger" : "btn btn-outline-danger";
    botao.dataset.tipoRelatorio = tipo;
    botao.setAttribute("aria-pressed", String(tipo === tipoRelatorioAtual));
    botao.textContent = rotulo;
    seletor.appendChild(botao);
  });

  const tabelaResponsiva = card.querySelector(".table-responsive");
  if (tabelaResponsiva) card.insertBefore(seletor, tabelaResponsiva);
  else card.appendChild(seletor);
}

function atualizarMetricasEstoque(itens) {
  const totalItens = document.getElementById("total-itens");
  const totalUnidades = document.getElementById("total-unidades");
  const totalAlertas = document.getElementById("total-alertas");
  if (totalItens) totalItens.textContent = itens.length;
  if (totalUnidades) {
    totalUnidades.textContent = itens.reduce(
      (total, item) => total + Number(item.quantidade || 0),
      0,
    );
  }
  if (totalAlertas) {
    totalAlertas.textContent = itens.filter(
      (item) =>
        String(item.tipo_item || "").toUpperCase() === "PECA" &&
        Number(item.quantidade || 0) < 3,
    ).length;
  }
}

function renderizarResumo(tipo, resumo, itens) {
  const elemento = document.getElementById("resumo-relatorio");
  if (!elemento) return;
  let metricas;
  if (tipo === "estoque") {
    const totalUnidades = itens.reduce(
      (total, item) => total + Number(item.quantidade || 0),
      0,
    );
    const alertas = itens.filter(
      (item) =>
        String(item.tipo_item || "").toUpperCase() === "PECA" &&
        Number(item.quantidade || 0) < 3,
    ).length;
    metricas = [
      ["Itens", itens.length],
      ["Unidades", totalUnidades],
      ["Alertas", alertas],
    ];
  } else if (tipo === "movimentacoes") {
    metricas = [
      ["Movimentações", resumo.total_registros ?? itens.length],
      ["Entradas", resumo.total_entradas ?? contarTipo(itens, "ENTRADA")],
      ["Saídas", resumo.total_saidas ?? contarTipo(itens, "SAIDA")],
      ["Ajustes", resumo.total_ajustes ?? contarTipo(itens, "AJUSTE")],
    ];
  } else {
    metricas = [
      ["Lançamentos", resumo.total_registros ?? itens.length],
      ["Unidades", resumo.total_unidades ?? itens.reduce((total, item) => total + Number(item.quantidade || 0), 0)],
    ];
    if (tipo === "saidas") {
      metricas.push(["Total vendido", formatarMoeda(resumo.total_vendido || 0)]);
    }
  }
  elemento.innerHTML = metricas
    .map(
      ([rotulo, valor]) =>
        `<div class="col"><div class="card border-0 bg-light p-3 h-100"><span class="small text-muted fw-bold">${escapar(rotulo.toUpperCase())}</span><strong class="fs-4">${escapar(valor)}</strong></div></div>`,
    )
    .join("");
}

function contarTipo(itens, tipo) {
  return itens.filter(
    (item) => String(item.tipo || "").toUpperCase() === tipo,
  ).length;
}

function abrirModalCancelamento(id) {
  let modal = document.getElementById("modal-cancelamento-saida");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-cancelamento-saida";
    modal.className = "position-fixed top-0 start-0 w-100 h-100 d-none";
    modal.style.cssText = "z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:1rem";
    modal.innerHTML = `<div class="bg-white rounded-4 shadow p-4" style="width:min(440px,100%)"><h5 class="fw-bold">Estornar saída</h5><p class="text-muted small">O estoque será devolvido e a saída permanecerá no histórico como cancelada.</p><textarea id="motivo-cancelamento-saida" class="form-control mb-3" maxlength="255" rows="3" placeholder="Motivo obrigatório"></textarea><div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-light" onclick="fecharModalCancelamento()">Voltar</button><button type="button" class="btn btn-danger" onclick="confirmarCancelamentoSaida()">Confirmar estorno</button></div></div>`;
    document.body.appendChild(modal);
  }
  modal.dataset.idSaida = String(id);
  modal.classList.remove("d-none");
  document.getElementById("motivo-cancelamento-saida").value = "";
  document.getElementById("motivo-cancelamento-saida").focus();
}

function fecharModalCancelamento() {
  document.getElementById("modal-cancelamento-saida")?.classList.add("d-none");
}

async function confirmarCancelamentoSaida() {
  const modal = document.getElementById("modal-cancelamento-saida");
  const motivo = document.getElementById("motivo-cancelamento-saida")?.value.trim();
  if (!motivo) return mostrarMensagem("Informe o motivo do estorno.", "warning");
  try {
    const resposta = await fetchAutenticado(`/saida/${modal.dataset.idSaida}/cancelar`, { method: "POST", body: JSON.stringify({ motivo_cancelamento: motivo }) });
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) throw new Error(resultado.mensagem || "Não foi possível estornar a saída.");
    fecharModalCancelamento();
    mostrarMensagem("Saída estornada e estoque devolvido com sucesso.", "success");
    await carregarRelatorio("saidas");
  } catch (erro) {
    mostrarMensagem(erro.message || "Não foi possível estornar a saída.", "danger");
  }
}

function renderizarTabelaRelatorio(configuracao, itens) {
  const tabela = document.getElementById("tabela-relatorio");
  if (!tabela) return;
  tabela.innerHTML = itens.length
    ? itens
        .map(
          (item) =>
            `<tr>${configuracao.colunas
              .map((coluna) => {
                const valor = coluna.valor(item);
                return `<td>${coluna.html ? valor : escapar(valor === undefined || valor === null || valor === "" ? "-" : valor)}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("")
    : `<tr><td colspan="${configuracao.colunas.length}" class="text-center py-4 text-muted">Nenhum registro encontrado neste relatório.</td></tr>`;
}

function formatarQuantidadeMovimentacao(tipo, quantidade) {
  const valor = Number(quantidade || 0);
  if (!Number.isFinite(valor)) return "-";
  const operacao = String(tipo || "").toUpperCase();
  if (operacao === "SAIDA") return `-${Math.abs(valor)}`;
  if (operacao === "AJUSTE") return valor > 0 ? `+${valor}` : String(valor);
  return `+${Math.abs(valor)}`;
}

function exportarWord() {
  if (!relatorioAtual) {
    return mostrarMensagem("Carregue um relatório antes de exportar.", "warning");
  }
  const documento = criarDocumentoRelatorio();
  const blob = new Blob(["\uFEFF", documento], {
    type: "application/msword;charset=utf-8",
  });
  baixarArquivo(
    blob,
    `relatorio-${relatorioAtual.tipo}-${new Date().toISOString().slice(0, 10)}.doc`,
  );
}

function exportarCsv() {
  if (!relatorioAtual) {
    return mostrarMensagem("Carregue um relatório antes de exportar.", "warning");
  }
  const configuracao = TIPOS_RELATORIO[relatorioAtual.tipo];
  const colunas = colunasExportaveis(configuracao);
  const linhas = [
    colunas.map((coluna) => coluna.titulo),
    ...relatorioAtual.itens.map((item) =>
      colunas.map((coluna) => valorExportacao(coluna, item)),
    ),
  ];
  const csv = "\uFEFF" + linhas
    .map((linha) => linha.map(escaparCsv).join(";"))
    .join("\r\n");
  baixarArquivo(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `relatorio-${relatorioAtual.tipo}-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function exportarExcel() {
  if (!relatorioAtual) return mostrarMensagem("Carregue um relatório antes de exportar.", "warning");
  const configuracao = TIPOS_RELATORIO[relatorioAtual.tipo];
  const colunas = colunasExportaveis(configuracao);
  const cabecalho = colunas.map((coluna) => `<th>${escapar(coluna.titulo)}</th>`).join("");
  const linhas = relatorioAtual.itens.map((item) => `<tr>${colunas.map((coluna) => `<td>${escapar(valorExportacao(coluna, item) || "-")}</td>`).join("")}</tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#202124}h1{color:#9f1239;font-size:20px}p{color:#666}.tabela{border-collapse:collapse;width:100%;font-size:12px}.tabela th{background:#9f1239;color:#fff;border:1px solid #7f0d2f;padding:9px;text-align:left}.tabela td{border:1px solid #d1d5db;padding:8px;vertical-align:top}.tabela tr:nth-child(even) td{background:#f8fafc}</style></head><body><h1>${escapar(configuracao.titulo)}</h1><p>${escapar(configuracao.descricao)}<br>Gerado em ${escapar(formatarDataHoraRelatorio(relatorioAtual.geradoEm))}</p><table class="tabela"><thead><tr>${cabecalho}</tr></thead><tbody>${linhas || `<tr><td colspan="${colunas.length}">Nenhum registro encontrado.</td></tr>`}</tbody></table></body></html>`;
  baixarArquivo(new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8" }), `relatorio-${relatorioAtual.tipo}-${new Date().toISOString().slice(0, 10)}.xls`);
}

function criarDocumentoRelatorio() {
  const configuracao = TIPOS_RELATORIO[relatorioAtual.tipo];
  const colunas = colunasExportaveis(configuracao);
  const cabecalho = colunas
    .map((coluna) => `<th>${escapar(coluna.titulo)}</th>`)
    .join("");
  const linhas = relatorioAtual.itens
    .map(
      (item) =>
          `<tr>${colunas
          .map((coluna) => `<td>${escapar(valorExportacao(coluna, item) || "-")}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const email = escapar(obterEmailGerador());
  const data = escapar(formatarDataHoraRelatorio(relatorioAtual.geradoEm));
  return `<!DOCTYPE html><html lang="pt-BR" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><meta name="ProgId" content="Word.Document"><title>${escapar(configuracao.titulo)}</title><style>@page Relatorio{size:29.7cm 21cm;margin:1.5cm;mso-page-orientation:landscape}div.Relatorio{page:Relatorio}body{font-family:Arial,sans-serif;color:#202124;font-size:10pt}.marca{font-size:9pt;color:#666}.titulo{font-size:20pt;color:#9f1239;margin:5px 0}.meta{font-size:9pt;color:#444;line-height:1.5}.linha{border:0;border-top:2px solid #9f1239;margin:12px 0}table{width:100%;border-collapse:collapse;table-layout:auto;margin-top:16px;font-size:8.5pt}th{background:#9f1239;color:#fff;text-align:left;padding:7px;border:1px solid #9f1239}td{border:1px solid #d1d5db;padding:6px;vertical-align:top}tr:nth-child(even) td{background:#f7f7f7}</style></head><body><div class="Relatorio"><div class="marca">AutoNoMoz · Gestão de Frota</div><h1 class="titulo">${escapar(configuracao.titulo)}</h1><div class="meta">${escapar(configuracao.descricao)}<br><strong>Gerado por:</strong> ${email}<br><strong>Data e hora:</strong> ${data}<br><strong>Total de registros:</strong> ${relatorioAtual.itens.length}</div><hr class="linha"><table><thead><tr>${cabecalho}</tr></thead><tbody>${linhas || `<tr><td colspan="${colunas.length}">Nenhum registro encontrado.</td></tr>`}</tbody></table></div></body></html>`;
}

function colunasExportaveis(configuracao) {
  return configuracao.colunas.filter((coluna) => !coluna.html && !coluna.naoExportar);
}

function valorExportacao(coluna, item) {
  const valor = coluna.valor(item);
  return String(valor === undefined || valor === null ? "" : valor)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escaparCsv(valor) {
  return `"${String(valor ?? "").replace(/"/g, '""')}"`;
}

function formatarDataHoraRelatorio(valor) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? "Data não disponível"
    : data.toLocaleString("pt-BR");
}

function imprimirRelatorio() {
  if (!relatorioAtual) {
    return mostrarMensagem("Carregue um relatório antes de imprimir.", "warning");
  }
  const janela = window.open("", "_blank", "width=1200,height=800");
  if (!janela) {
    return mostrarMensagem(
      "O navegador bloqueou a janela de impressão. Permita pop-ups para este endereço.",
      "warning",
    );
  }
  janela.document.open();
  janela.document.write(criarDocumentoRelatorio());
  janela.document.close();
  janela.focus();
  janela.onload = () => janela.print();
}

function mostrarMensagem(texto, tipo) {
  const elemento = document.getElementById("mensagem-gerencia");
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `alert alert-${tipo} mt-4`;
}

function escapar(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caractere) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        caractere
      ],
  );
}
