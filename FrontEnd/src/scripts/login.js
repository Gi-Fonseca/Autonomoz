document.addEventListener("DOMContentLoaded", () => {
  configurarBotoesCargo();
  configurarAlternarSenha();
  configurarLogin();
  document.querySelector(".form-forms__reset-link")?.addEventListener("click", resetarSenha);
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
        throw new Error(
          resultado.mensagem || "E-mail ou senha inválidos.",
        );
      }

      const dados = resultado.dados || {};

      if (!dados.token || !dados.usuario) {
        throw new Error("O backend não retornou um token de acesso válido.");
      }

      const cargoRetornado = String(dados.usuario.cargo || "").trim().toLowerCase();
      if (cargoRetornado !== cargoSelecionado.toLowerCase()) {
        throw new Error(
          "O perfil selecionado não corresponde ao cargo desta conta.",
        );
      }

      salvarSessaoJWT(dados.token, dados.usuario);
      window.location.href = "index.html";
    } catch (erro) {
      console.error("Erro no login:", erro);
      mostrarAviso(erro.message || "Não foi possível conectar ao backend.");
    } finally {
      botaoLogin.disabled = false;
      botaoLogin.innerHTML = textoOriginal;
    }
  }
}

async function resetarSenha() {
  const email = window.prompt("Digite o e-mail da sua conta:");
  if (email === null) return;
  const cpf = window.prompt("Digite o CPF cadastrado (somente números):");
  if (cpf === null) return;
  const novaSenha = window.prompt("Digite a nova senha (mínimo de 8 caracteres):");
  if (novaSenha === null) return;
  const confirmacao = window.prompt("Digite novamente a nova senha:");
  if (confirmacao === null) return;
  if (novaSenha !== confirmacao) {
    mostrarAviso("As senhas não conferem.", "aviso");
    return;
  }
  try {
    const resposta = await fetch(`${API_URL}/funcionario/resetar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.trim(), cpf: cpf.replace(/\D/g, ""), novaSenha }),
    });
    const resultado = await resposta.json();
    if (!resposta.ok || !resultado.sucesso) throw new Error(resultado.mensagem || "Não foi possível redefinir a senha.");
    const emailInput = document.querySelector("#email");
    const senhaInput = document.querySelector("#senha");
    if (emailInput) emailInput.value = email.trim();
    if (senhaInput) senhaInput.value = novaSenha;
    mostrarAviso("Senha redefinida. Agora clique em Iniciar Sessão usando a nova senha.", "sucesso", 7000);
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro);
    mostrarAviso(erro.message || "Não foi possível redefinir a senha.");
  }
}
