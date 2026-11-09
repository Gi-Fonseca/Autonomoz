document.addEventListener("DOMContentLoaded", () => {
  configurarBotoesCargo();
  configurarAlternarSenha();
  configurarLogin();
});

let cargoSelecionado = "";

function configurarBotoesCargo() {
  const botoes = document.querySelectorAll(".form-btns__btn");

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const cargo = botao.querySelector("p")?.textContent.trim();
      if (cargo !== "Gerente" && cargo !== "Estoquista") return;

      botoes.forEach((item) => item.classList.remove("active"));
      botao.classList.add("active");
      cargoSelecionado = cargo;
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
      mostrarAviso("Informe o e-mail e a senha.");
      return;
    }

    if (!cargoSelecionado) {
      mostrarAviso("Selecione Gerente ou Estoquista antes de entrar.", "aviso");
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
        body: JSON.stringify({ email, senha, cargo: cargoSelecionado }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.mensagem || "E-mail ou senha inválidos.");
      }

      const dados = resultado.dados || {};

      if (!dados.token || !dados.usuario) {
        throw new Error("O backend não retornou um token de acesso válido.");
      }

      const cargoRetornado = String(dados.usuario.cargo || "")
        .trim()
        .toLowerCase();
      if (cargoRetornado !== cargoSelecionado.toLowerCase()) {
        throw new Error(
          "O perfil selecionado não corresponde ao cargo desta conta.",
        );
      }

      salvarSessaoJWT(dados.token, dados.usuario);
      window.location.href = "index.html";
    } catch (erro) {
      console.error("Erro no login:", erro);
      const mensagem =
        erro instanceof TypeError
          ? "Não foi possível conectar ao servidor. Verifique se o backend está iniciado em http://localhost:3000."
          : erro.message || "Não foi possível concluir o login.";
      mostrarAviso(mensagem);
    } finally {
      botaoLogin.disabled = false;
      botaoLogin.innerHTML = textoOriginal;
    }
  }
}
