document.addEventListener("DOMContentLoaded", () => {
  const email = document.querySelector("#email");
  const codigo = document.querySelector("#codigo");
  const novaSenha = document.querySelector("#novaSenha");
  const etapaCodigo = document.querySelector("#etapaCodigo");
  const solicitarBtn = document.querySelector("#solicitarBtn");
  const form = document.querySelector("#resetForm");

  async function requisicao(rota, body) {
    try {
      const resposta = await fetch(`${API_URL}${rota}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !resultado.sucesso) throw new Error(resultado.mensagem || "Não foi possível concluir a operação.");
      return resultado;
    } catch (erro) {
      if (erro instanceof TypeError) throw new Error("Não foi possível conectar ao servidor. Inicie o backend em http://localhost:3000 e tente novamente.");
      throw erro;
    }
  }

  solicitarBtn.addEventListener("click", async () => {
    if (!email.value.trim()) return mostrarAviso("Informe seu e-mail.", "aviso");
    solicitarBtn.disabled = true;
    try {
      const resultado = await requisicao("/funcionario/solicitar-reset", { email: email.value.trim() });
      etapaCodigo.hidden = false;
      if (resultado.dados?.codigo) {
        codigo.value = resultado.dados.codigo;
        mostrarAviso(`Código de teste: ${resultado.dados.codigo}`, "info", 10000);
      } else {
        mostrarAviso(resultado.mensagem, "sucesso", 7000);
      }
    } catch (erro) { mostrarAviso(erro.message, "erro"); }
    finally { solicitarBtn.disabled = false; }
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!/^\d{6}$/.test(codigo.value.trim())) return mostrarAviso("Informe o código de 6 dígitos.", "aviso");
    if (novaSenha.value.length < 8) return mostrarAviso("A nova senha deve ter no mínimo 8 caracteres.", "aviso");
    try {
      const resultado = await requisicao("/funcionario/resetar-senha", { email: email.value.trim(), codigo: codigo.value.trim(), novaSenha: novaSenha.value });
      mostrarAviso(resultado.mensagem, "sucesso", 5000);
      setTimeout(() => { window.location.href = "login.html"; }, 1400);
    } catch (erro) { mostrarAviso(erro.message, "erro"); }
  });
});
