document.addEventListener("DOMContentLoaded", () => {
  configurarBotoesCargo();
  configurarAlternarSenha();
  configurarLogin();
});

function configurarBotoesCargo() {
  const botoes = document.querySelectorAll(".form-btns__btn");

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoes.forEach((item) => item.classList.remove("active"));
      botao.classList.add("active");
    });
  });
}

function configurarAlternarSenha() {
  const botao = document.querySelector("#toggleSenha");
  const input = document.querySelector("#senha");

  if (!botao || !input) return;

  botao.addEventListener("click", () => {
    const senhaOculta = input.getAttribute("type") === "password";
    input.setAttribute("type", senhaOculta ? "text" : "password");
    botao.classList.toggle("fa-eye", !senhaOculta);
    botao.classList.toggle("fa-eye-slash", senhaOculta);
  });
}

function configurarLogin() {
  const botaoLogin = document.querySelector(".form-body__btn");
  const emailInput = document.querySelector("#email");
  const senhaInput = document.querySelector("#senha");

  if (!botaoLogin || !emailInput || !senhaInput) return;

  botaoLogin.addEventListener("click", realizarLogin);

  [emailInput, senhaInput].forEach((input) => {
    input.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") realizarLogin();
    });
  });

  async function realizarLogin() {
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
      alert("Informe o e-mail e a senha.");
      return;
    }

    botaoLogin.disabled = true;
    const textoOriginal = botaoLogin.innerHTML;
    botaoLogin.innerHTML = "Entrando...";

    try {
      const resposta = await fetch(`${API_URL}/funcionario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(
          resultado.mensagem || "E-mail ou senha inválidos.",
        );
      }

      const dados = resultado.dados || {};

      if (!dados.token || !dados.usuario) {
        throw new Error("O backend não retornou um token de acesso válido.");
      }

      salvarSessaoJWT(dados.token, dados.usuario);
      window.location.href = "index.html";
    } catch (erro) {
      console.error("Erro no login:", erro);
      alert(erro.message || "Não foi possível conectar ao backend.");
    } finally {
      botaoLogin.disabled = false;
      botaoLogin.innerHTML = textoOriginal;
    }
  }
}
