document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  carregarHistorico();
});

function extrairLinhasMovimentacoes(payload) {
  let atual = payload;
  for (let nivel = 0; nivel < 5; nivel += 1) {
    if (Array.isArray(atual)) return atual;
    if (!atual || typeof atual !== "object") return null;
    const valores = [atual.dados, atual.data, atual.movimentacoes, atual.rows, atual.result];
    const lista = valores.find(Array.isArray);
    if (lista) return lista;
    atual = valores.find((valor) => valor && typeof valor === "object");
    if (!atual) return null;
  }
  return null;
}

async function carregarHistorico() {
  const tabela = document.getElementById("tabela-movimentacoes");
  const mensagem = document.getElementById("mensagem-historico");
  if (!tabela) return;
  tabela.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Carregando histórico...</td></tr>';
  try {
    const resposta = await fetchAutenticado("/movimentacao");
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(resultado.mensagem || "Erro ao buscar histórico.");
    }
    const linhas = extrairLinhasMovimentacoes(resultado);
    if (!linhas) throw new Error("A resposta da API veio em um formato inesperado.");
    tabela.innerHTML = linhas.length
      ? linhas.map(renderizarMovimentacao).join("")
      : '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhuma movimentação encontrada.</td></tr>';
    if (mensagem) mensagem.className = "alert d-none";
  } catch (erro) {
    console.error("Erro ao carregar o histórico:", erro);
    tabela.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Não foi possível carregar o histórico.</td></tr>';
    if (mensagem) {
      mensagem.className = "alert alert-danger";
      mensagem.textContent = erro.message;
    }
  }
}

function renderizarMovimentacao(item) {
  const tipo = String(item.tipo || "MOVIMENTAÇÃO").toUpperCase();
  const classe = tipo.includes("ENTRADA") ? "success" : tipo.includes("SAIDA") ? "danger" : "warning";
  const quantidade = formatarQuantidadeMovimentacao(tipo, item.quantidade);
  const motivo = item.motivo || item.motivo_entrada || item.motivo_saida || item.motivo_ajuste || "-";
  return `<tr>
    <td class="ps-3 text-muted small">${escaparHtml(formatarData(item.data_movimentacao))}</td>
    <td class="fw-bold">${escaparHtml(item.produto_nome || "-")}</td>
    <td><span class="badge bg-${classe}-subtle text-${classe} fw-bold">${escaparHtml(tipo)}</span></td>
    <td class="fw-bold text-${classe}">${escaparHtml(quantidade)}</td>
    <td>${escaparHtml(item.funcionario_nome || "-")}</td>
    <td class="small text-muted">${escaparHtml(motivo)}</td>
  </tr>`;
}

function formatarQuantidadeMovimentacao(tipo, valor) {
  const quantidade = Number(valor || 0);
  if (!Number.isFinite(quantidade)) return "-";
  if (tipo.includes("SAIDA")) return `-${Math.abs(quantidade)}`;
  if (tipo === "AJUSTE") return quantidade > 0 ? `+${quantidade}` : String(quantidade);
  return `+${Math.abs(quantidade)}`;
}

function escaparHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caractere],
  );
}
