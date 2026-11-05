document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  try {
    const [resposta, respostaVeiculos, respostaMovimentacoes] =
      await Promise.all([
        fetchAutenticado("/produto?limit=5000"),
        fetchAutenticado("/produto?tipo_item=VEICULO&limit=5000"),
        fetchAutenticado("/movimentacao"),
      ]);
    if (!resposta || !respostaVeiculos || !respostaMovimentacoes) return;
    const resultado = await resposta.json();
    const resultadoVeiculos = await respostaVeiculos.json();
    const resultadoMovimentacoes = await respostaMovimentacoes.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(resultado.mensagem || "Erro ao carregar produtos");
    if (!respostaVeiculos.ok || resultadoVeiculos.sucesso === false)
      throw new Error(
        resultadoVeiculos.mensagem || "Erro ao carregar veículos",
      );
    if (!respostaMovimentacoes.ok || resultadoMovimentacoes.sucesso === false)
      throw new Error(
        resultadoMovimentacoes.mensagem || "Erro ao carregar movimentações",
      );

    const produtos = Array.isArray(resultado.dados) ? resultado.dados : [];
    const ativos = produtos.filter((produto) => Boolean(produto.status));
    const veiculos = Array.isArray(resultadoVeiculos.dados)
      ? resultadoVeiculos.dados.filter((produto) => Boolean(produto.status))
      : [];
    const alertas = ativos.filter(
      (produto) =>
        String(produto.tipo_item || "").toUpperCase() === "PECA" &&
        Number(produto.quantidade || 0) < 3,
    );
    const movimentacoes = Array.isArray(resultadoMovimentacoes.dados)
      ? resultadoMovimentacoes.dados
      : resultadoMovimentacoes.dados?.dados || [];
    const totalEstoque = produtos.reduce(
      (total, produto) => total + Number(produto.quantidade || 0),
      0,
    );
    const totalSaidas = movimentacoes
      .filter(
        (movimentacao) =>
          String(movimentacao.tipo || "").toUpperCase() === "SAIDA",
      )
      .reduce(
        (total, movimentacao) => total + Number(movimentacao.quantidade || 0),
        0,
      );
    const giro = totalEstoque > 0 ? totalSaidas / totalEstoque : 0;

    const total = document.getElementById("dash-total-itens");
    const alertasEl = document.getElementById("dash-alertas");
    const veiculosEl = document.getElementById("dash-veiculos");
    const disponibilidadeEl = document.getElementById("dash-disponibilidade");
    const giroEl = document.getElementById("giro-inventario");
    if (total) total.textContent = produtos.length;
    if (alertasEl) alertasEl.textContent = alertas.length;
    if (veiculosEl) veiculosEl.textContent = veiculos.length;
    if (disponibilidadeEl)
      disponibilidadeEl.textContent = `${veiculos.filter((item) => Number(item.quantidade || 0) > 0).length} com quantidade disponível`;
    if (giroEl) giroEl.textContent = `${giro.toFixed(1).replace(".", ",")}x`;
  } catch (erro) {
    console.error("Erro ao carregar Dashboard:", erro);
    const disponibilidadeEl = document.getElementById("dash-disponibilidade");
    const giroEl = document.getElementById("giro-inventario");
    if (disponibilidadeEl)
      disponibilidadeEl.textContent = "Não foi possível consultar o banco";
    if (giroEl) giroEl.textContent = "Indisponível";
  }
});
