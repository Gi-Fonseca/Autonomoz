document.addEventListener("DOMContentLoaded", async () => {
  verificarAutenticacao();
  try {
    const [resposta, respostaVeiculos] = await Promise.all([
      fetchAutenticado("/produto?limit=5000"),
      fetchAutenticado("/produto?tipo_item=VEICULO&limit=5000"),
    ]);
    if (!resposta || !respostaVeiculos) return;
    const resultado = await resposta.json();
    const resultadoVeiculos = await respostaVeiculos.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(resultado.mensagem || "Erro ao carregar produtos");
    if (!respostaVeiculos.ok || resultadoVeiculos.sucesso === false)
      throw new Error(
        resultadoVeiculos.mensagem || "Erro ao carregar veículos",
      );
    const produtos = Array.isArray(resultado.dados) ? resultado.dados : [];
    const ativos = produtos.filter((produto) => Boolean(produto.status));
    const veiculos = Array.isArray(resultadoVeiculos.dados)
      ? resultadoVeiculos.dados.filter((produto) => Boolean(produto.status))
      : [];
    const alertas = ativos.filter(
      (produto) =>
        Number(produto.quantidade || 0) <= Number(produto.estoque_minimo || 0),
    );
    const total = document.getElementById("dash-total-itens");
    const alertasEl = document.getElementById("dash-alertas");
    const veiculosEl = document.getElementById("dash-veiculos");
    const disponibilidadeEl = document.getElementById("dash-disponibilidade");
    if (total) total.textContent = produtos.length;
    if (alertasEl) alertasEl.textContent = alertas.length;
    if (veiculosEl) veiculosEl.textContent = veiculos.length;
    if (disponibilidadeEl)
      disponibilidadeEl.textContent = `${veiculos.filter((item) => Number(item.quantidade || 0) > 0).length} com quantidade disponível`;
  } catch (erro) {
    console.error("Erro ao carregar Dashboard:", erro);
    const disponibilidadeEl = document.getElementById("dash-disponibilidade");
    if (disponibilidadeEl)
      disponibilidadeEl.textContent = "Não foi possível consultar o banco";
  }
});
