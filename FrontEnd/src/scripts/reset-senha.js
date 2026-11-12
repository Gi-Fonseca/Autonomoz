document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const email = document.getElementById("email");
  const cpf = document.getElementById("cpf");
  const novaSenha = document.getElementById("novaSenha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const botao = document.getElementById("resetarBtn");

  cpf?.addEventListener("input", () => {
    cpf.value = cpf.value.replace(/\D/g, "").slice(0, 11);
  });

  form?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const emailValor = email.value.trim();
    const cpfValor = cpf.value.replace(/\D/g, "");

    if (!emailValor || cpfValor.length !== 11) {
      mostrarAviso("Informe um e-mail e um CPF válido.", "aviso");
      return;
    }
    if (novaSenha.value.length < 8) {
      mostrarAviso("A nova senha deve ter no mínimo 8 caracteres.", "aviso");
      return;
    }
    if (novaSenha.value !== confirmarSenha.value) {
      mostrarAviso("As senhas não conferem.", "aviso");
      return;
    }

    const textoOriginal = botao.innerHTML;
    botao.disabled = true;
    botao.innerHTML = "Salvando...";
    try {
      const resposta = await fetch(`${API_URL}/funcionario/resetar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: emailValor, cpf: cpfValor, novaSenha: novaSenha.value }),
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.mensagem || "Não foi possível redefinir a senha.");
      }
      mostrarAviso("Senha redefinida com sucesso. Você será levado ao login.", "sucesso", 3000);
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (erro) {
      mostrarAviso(erro.message || "Não foi possível redefinir a senha.", "erro");
    } finally {
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
    }
  });
});
