document.addEventListener("DOMContentLoaded", () => {
  configurarBotoesCargo();
  configurarAlternarSenha();
  configurarCPF();
  configurarCadastro();
});

let cargoSelecionado = "";

function configurarBotoesCargo() {
  const botoes = document.querySelectorAll(".form-btns__btn");

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoes.forEach((item) => item.classList.remove("active"));
      botao.classList.add("active");

      const texto = botao.querySelector("p")?.textContent.trim();
      cargoSelecionado = texto === "Gerente" ? "Gerente" : "Estoquista";
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

function configurarCPF() {
  const input = document.querySelector("#cpf");
  if (!input) return;

  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, "").substring(0, 11);

    if (valor.length > 9) {
      valor = valor.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{1,2})$/,
        "$1.$2.$3-$4",
      );
    } else if (valor.length > 6) {
      valor = valor.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
    } else if (valor.length > 3) {
      valor = valor.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
    }

    input.value = valor;
  });
}

function configurarCadastro() {
  const botao = document.querySelector(".form-body__btn");

  if (!botao) return;

  botao.addEventListener("click", realizarCadastro);

  async function realizarCadastro() {
    const nome = document.querySelector("#nome").value.trim();
    const cpf = document.querySelector("#cpf").value.trim();
    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#senha").value;

    if (!cargoSelecionado) {
      alert("Selecione o cargo Gerente ou Estoquista.");
      return;
    }

    if (!nome || !cpf || !email || !senha) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha.length < 8) {
      alert("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    const token = obterTokenJWT();

    if (!token) {
      alert("Você precisa fazer login como Gerente para cadastrar um funcionário.");
      window.location.href = "login.html";
      return;
    }

    const textoOriginal = botao.innerHTML;
    botao.disabled = true;
    botao.innerHTML = "Cadastrando...";

    try {
      const resposta = await fetchAutenticado("/funcionario", {
        method: "POST",
        body: JSON.stringify({
          cargo: cargoSelecionado,
          nome,
          cpf,
          email,
          senha,
        }),
      });

      if (!resposta) return;

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Não foi possível cadastrar o funcionário.");
      }

      alert("Funcionário cadastrado com sucesso!");
      window.location.href = "index.html";
    } catch (erro) {
      console.error("Erro ao cadastrar funcionário:", erro);
      alert(erro.message || "Erro ao cadastrar funcionário.");
    } finally {
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
    }
  }
}
