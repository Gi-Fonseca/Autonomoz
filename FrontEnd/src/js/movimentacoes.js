document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  carregarHistorico();
});

function extrairLinhasMovimentacoes(payload) {
  let atual = payload;

  for (let nivel = 0; nivel < 5; nivel += 1) {
    if (Array.isArray(atual)) return atual;
    if (!atual || typeof atual !== "object") return null;

    const valores = [
      atual.dados,
      atual.data,
      atual.movimentacoes,
      atual.rows,
      atual.result,
    ];
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

  try {
    const resposta = await fetchAutenticado("/movimentacao");
    if (!resposta) return;

    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(resultado.mensagem || "Erro ao buscar histórico");
    }

    const linhas = extrairLinhasMovimentacoes(resultado);
    if (!linhas) {
      throw new Error(
        "A resposta da API de movimentações veio em um formato inesperado.",
      );
    }

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
