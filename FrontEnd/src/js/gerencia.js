let relatorioAtual = null;

document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  const usuario = obterUsuarioLogado();
  const perfil = document.getElementById("perfil-gerencia");
  if (!usuario || usuario.cargo !== "Gerente") {
    perfil.textContent = "Acesso restrito ao Gerente";
    mostrarMensagem(
      "Apenas usuários com cargo Gerente podem acessar relatórios e operações administrativas.",
      "danger",
    );
    return;
  }
  perfil.textContent = `Gerente: ${usuario.nome}`;
  document.getElementById("conteudo-gerencia").classList.remove("d-none");
  document
    .getElementById("btn-gerar")
    .addEventListener("click", carregarRelatorio);
  document
    .getElementById("btn-atualizar")
    .addEventListener("click", carregarRelatorio);
  document
    .getElementById("btn-exportar")
    .addEventListener("click", exportarCsv);
  document
    .getElementById("btn-imprimir")
    .addEventListener("click", () => window.print());
});

async function carregarRelatorio() {
  try {
    const resposta = await fetchAutenticado("/relatorios/estoque");
    if (!resposta) return;
    const contentType = resposta.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const texto = await resposta.text();
      throw new Error(
        `A rota /relatorios/estoque não retornou JSON (HTTP ${resposta.status}). ` +
          "Reinicie o backend atualizado e confirme que a rota de relatórios foi adicionada.",
      );
    }
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(
        resultado.mensagem || "Não foi possível gerar o relatório.",
      );
    relatorioAtual = resultado.dados || {};
    const resumo = relatorioAtual.resumo || {};
    document.getElementById("total-itens").textContent =
      resumo.total_itens || 0;
    document.getElementById("total-unidades").textContent =
      resumo.total_unidades || 0;
    document.getElementById("total-alertas").textContent =
      resumo.total_alertas || 0;
    const itens = Array.isArray(relatorioAtual.itens)
      ? relatorioAtual.itens
      : [];
    document.getElementById("tabela-relatorio").innerHTML = itens.length
      ? itens
          .map((item) => {
            const alerta =
              Number(item.quantidade) <= Number(item.estoque_minimo || 0);
            return `<tr><td class="fw-semibold">${escapar(item.nome)}</td><td>${item.tipo_item === "VEICULO" ? "Veículo" : "Peça"}</td><td>${escapar(item.categoria || "-")}</td><td>${item.quantidade}</td><td>${item.estoque_minimo || 0}</td><td><span class="badge ${alerta ? "text-bg-danger" : "text-bg-success"}">${alerta ? "Atenção" : "Regular"}</span></td></tr>`;
          })
          .join("")
      : '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum item encontrado.</td></tr>';
  } catch (erro) {
    mostrarMensagem(erro.message, "danger");
  }
}

function exportarCsv() {
  if (!relatorioAtual)
    return mostrarMensagem("Gere o relatório antes de exportar.", "warning");
  const linhas = [
    [
      "Produto",
      "Descrição",
      "Tipo",
      "Categoria",
      "Fornecedor",
      "Quantidade",
      "Estoque mínimo",
      "Status",
    ],
  ];
  (relatorioAtual.itens || []).forEach((item) =>
    linhas.push([
      item.nome,
      item.descricao || "",
      item.tipo_item,
      item.categoria || "",
      item.fornecedor_nome || "",
      item.quantidade,
      item.estoque_minimo || 0,
      Number(item.quantidade) <= Number(item.estoque_minimo || 0)
        ? "Atenção"
        : "Regular",
    ]),
  );
  const csv =
    "\ufeff" +
    linhas
      .map((linha) =>
        linha
          .map((valor) => `"${String(valor).replaceAll('"', '""')}"`)
          .join(";"),
      )
      .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  link.download = `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function mostrarMensagem(texto, tipo) {
  const el = document.getElementById("mensagem-gerencia");
  el.textContent = texto;
  el.className = `alert alert-${tipo} mt-4`;
}
function escapar(valor) {
  return String(valor).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}
