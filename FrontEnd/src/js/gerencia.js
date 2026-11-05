let relatorioAtual = null;

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
  document
    .getElementById("btn-atualizar")
    ?.addEventListener("click", carregarRelatorio);
  document
    .getElementById("btn-exportar")
    ?.addEventListener("click", exportarCsv);
  document
    .getElementById("btn-imprimir")
    ?.addEventListener("click", imprimirRelatorio);
  await carregarRelatorio();
});

async function carregarRelatorio() {
  const botao = document.getElementById("btn-atualizar");
  if (botao) {
    botao.disabled = true;
    botao.innerHTML = "Carregando...";
  }
  try {
    const resposta = await fetchAutenticado("/relatorios/estoque");
    if (!resposta) return;
    const contentType = resposta.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `A API retornou HTML em vez de JSON (HTTP ${resposta.status}). Reinicie o backend atualizado.`,
      );
    }
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(
        resultado.mensagem || "Não foi possível gerar o relatório.",
      );
    let dados = resultado.dados;
    if (dados && !Array.isArray(dados.itens) && dados.dados)
      dados = dados.dados;
    relatorioAtual = dados || { resumo: {}, itens: [] };
    const resumo = relatorioAtual.resumo || {};
    const itens = Array.isArray(relatorioAtual.itens)
      ? relatorioAtual.itens
      : [];
    const totalItens = document.getElementById("total-itens");
    const totalUnidades = document.getElementById("total-unidades");
    const totalAlertas = document.getElementById("total-alertas");
    if (totalItens) totalItens.textContent = resumo.total_itens ?? itens.length;
    if (totalUnidades)
      totalUnidades.textContent =
        resumo.total_unidades ??
        itens.reduce((total, item) => total + Number(item.quantidade || 0), 0);
    if (totalAlertas)
      totalAlertas.textContent =
        resumo.total_alertas ??
        itens.filter(
          (item) =>
            String(item.tipo_item || "").toUpperCase() === "PECA" &&
            Number(item.quantidade || 0) < 3,
        ).length;
    const tabela = document.getElementById("tabela-relatorio");
    if (tabela)
      tabela.innerHTML = itens.length
        ? itens
            .map((item) => {
              const alerta =
                String(item.tipo_item || "").toUpperCase() === "PECA" &&
                Number(item.quantidade || 0) < 3;
              return `<tr><td class="fw-semibold ${alerta ? "text-danger" : ""}">${escapar(item.nome)}</td><td>${String(item.tipo_item || "").toUpperCase() === "VEICULO" ? "Veículo" : "Peça"}</td><td>${escapar(item.categoria || "-")}</td><td>${item.quantidade ?? 0}</td><td>${item.estoque_minimo ?? 0}</td><td><span class="badge ${alerta ? "text-bg-danger" : "text-bg-success"}">${alerta ? "Atenção" : "Regular"}</span></td></tr>`;
            })
            .join("")
        : '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum item encontrado.</td></tr>';
    mostrarMensagem(
      "Relatório carregado com os dados atuais do banco.",
      "success",
    );
  } catch (erro) {
    console.error("Erro no relatório:", erro);
    mostrarMensagem(
      erro.message || "Não foi possível carregar o relatório.",
      "danger",
    );
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Atualizar';
    }
  }
}

function criarDocumentoRelatorio() {
  const itens = Array.isArray(relatorioAtual?.itens)
    ? relatorioAtual.itens
    : [];
  if (!itens.length) return null;
  const usuario = obterUsuarioLogado() || {};
  const email = usuario.email || "Não informado";
  const data = new Date().toLocaleString("pt-BR");
  const logo = `<svg width="42" height="30" viewBox="0 0 84 60" aria-label="Logo AutoNoMoz"><path fill="#b00020" d="M8 38h68l-5-17c-1-4-5-7-9-7H24c-5 0-8 3-10 7L8 38Zm10-13 4-7h40l4 7H18Z"/><circle cx="23" cy="43" r="7" fill="#222"/><circle cx="63" cy="43" r="7" fill="#222"/><path stroke="#b00020" stroke-width="4" d="M8 38h68"/></svg>`;
  const linhas = itens
    .map((item) => {
      const alerta =
        String(item.tipo_item || "").toUpperCase() === "PECA" &&
        Number(item.quantidade || 0) < 3;
      return `<tr><td class="produto ${alerta ? "alerta" : ""}">${escapar(item.nome)}</td><td>${escapar(item.descricao || "-")}</td><td>${String(item.tipo_item || "").toUpperCase() === "VEICULO" ? "Veículo" : "Peça"}</td><td>${escapar(item.categoria || "-")}</td><td>${escapar(item.fornecedor_nome || "-")}</td><td>${item.quantidade ?? 0}</td><td>${item.estoque_minimo ?? 0}</td><td>${alerta ? "Atenção" : "Regular"}</td></tr>`;
    })
    .join("");
  const documento = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório de estoque - ${data}</title><style>body{font-family:Arial,sans-serif;color:#202124;margin:36px}header{display:flex;align-items:center;border-bottom:3px solid #b00020;padding-bottom:14px;margin-bottom:24px}.logo{display:flex;align-items:center;gap:10px;color:#b00020;font-size:24px;font-weight:800}.sub{color:#666;font-size:12px;margin-top:3px}.meta{margin-left:auto;text-align:right;font-size:12px;color:#555}h1{font-size:22px;margin:0 0 6px}table{width:100%;border-collapse:collapse;margin-top:18px;font-size:12px}th{background:#b00020;color:#fff;text-align:left;padding:10px}td{border:1px solid #ddd;padding:9px}.produto.alerta{color:#c00000;font-weight:700}.resumo{display:flex;gap:28px;background:#f6f6f6;padding:14px;border-radius:6px}.rodape{margin-top:25px;color:#777;font-size:11px}@media print{body{margin:15px}}</style></head><body><header><div class="logo">${logo}<div>AutoNoMoz<div class="sub">GESTÃO DE FROTA</div></div></div><div class="meta"><strong>Relatório de estoque</strong><br>Exportado por: ${escapar(email)}<br>Data: ${escapar(data)}</div></header><h1>Relatório de estoque</h1><div class="resumo"><div><strong>Itens:</strong> ${itens.length}</div><div><strong>Unidades:</strong> ${itens.reduce((total, item) => total + Number(item.quantidade || 0), 0)}</div><div><strong>Alertas:</strong> ${itens.filter((item) => String(item.tipo_item || "").toUpperCase() === "PECA" && Number(item.quantidade || 0) < 3).length}</div></div><table><thead><tr><th>Produto</th><th>Descrição</th><th>Tipo</th><th>Categoria</th><th>Fornecedor</th><th>Quantidade</th><th>Estoque mínimo</th><th>Status</th></tr></thead><tbody>${linhas}</tbody></table><div class="rodape">Documento gerado pelo sistema AutoNoMoz.</div></body></html>`;
  return documento;
}

function exportarCsv() {
  const documento = criarDocumentoRelatorio();
  if (!documento)
    return mostrarMensagem(
      "O relatório ainda não possui dados para exportar.",
      "warning",
    );
  const url = URL.createObjectURL(
    new Blob([documento], { type: "application/msword;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function imprimirRelatorio() {
  const documento = criarDocumentoRelatorio();
  if (!documento)
    return mostrarMensagem(
      "O relatório ainda não possui dados para imprimir.",
      "warning",
    );
  const janela = window.open("", "_blank", "width=1200,height=800");
  if (!janela)
    return mostrarMensagem(
      "O navegador bloqueou a janela de impressão. Permita pop-ups para este endereço.",
      "warning",
    );
  janela.document.open();
  janela.document.write(documento);
  janela.document.close();
  janela.focus();
  janela.onload = () => {
    janela.print();
  };
}

function mostrarMensagem(texto, tipo) {
  const elemento = document.getElementById("mensagem-gerencia");
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `alert alert-${tipo} mt-4`;
}

function escapar(valor) {
  return String(valor ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}
