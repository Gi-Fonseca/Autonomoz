document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  carregarHistorico();
});

async function carregarHistorico() {
  const tabela = document.getElementById("tabela-movimentacoes");
  const mensagem = document.getElementById("mensagem-historico");
  try {
    const resposta = await fetchAutenticado("/movimentacao");
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(resultado.mensagem || "Erro ao buscar histórico");
    const dados = resultado.dados;
    const linhas = Array.isArray(dados)
      ? dados
      : Array.isArray(dados?.dados)
        ? dados.dados
        : [];
    tabela.innerHTML = linhas.length
      ? linhas
          .map((item) => {
            const tipo = String(item.tipo || "MOVIMENTAÇÃO");
            const classe = tipo.includes("ENTRADA")
              ? "success"
              : tipo.includes("SAIDA")
                ? "danger"
                : "warning";
            const quantidade = tipo.includes("SAIDA")
              ? `-${item.quantidade}`
              : `+${item.quantidade}`;
            return `<tr><td class="ps-3 text-muted small">${formatarData(item.data_movimentacao)}</td><td class="fw-bold">${item.produto_nome || "-"}</td><td><span class="badge bg-${classe}-subtle text-${classe} fw-bold">${tipo}</span></td><td class="fw-bold text-${classe}">${quantidade}</td><td>${item.funcionario_nome || "-"}</td><td class="small text-muted">${item.motivo || "-"}</td></tr>`;
          })
          .join("")
      : '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhuma movimentação encontrada.</td></tr>';
    mensagem.className = "alert d-none";
  } catch (erro) {
    tabela.innerHTML =
      '<tr><td colspan="6" class="text-center py-4 text-danger">Não foi possível carregar o histórico.</td></tr>';
    mensagem.className = "alert alert-danger";
    mensagem.textContent = erro.message;
  }
}
