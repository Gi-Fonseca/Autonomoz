(() => {
  const CHAVE_TEMA = "autonomoz-tema";
  const aplicarTema = (tema) => {
    const escuro = tema === "escuro";
    document.documentElement.dataset.tema = escuro ? "escuro" : "claro";
    document.documentElement.style.colorScheme = escuro ? "dark" : "light";
  };

  let temaSalvo = "claro";
  try {
    temaSalvo = localStorage.getItem(CHAVE_TEMA) === "escuro" ? "escuro" : "claro";
  } catch (_) {
    // O tema continua alternável nesta página se o armazenamento estiver bloqueado.
  }
  aplicarTema(temaSalvo);

  const criarBotao = () => {
    if (document.getElementById("alternar-tema")) return;
    const botao = document.createElement("button");
    botao.type = "button";
    botao.id = "alternar-tema";
    botao.className = "botao-tema";
    botao.setAttribute("aria-pressed", String(temaSalvo === "escuro"));
    botao.addEventListener("click", () => {
      temaSalvo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
      aplicarTema(temaSalvo);
      botao.setAttribute("aria-pressed", String(temaSalvo === "escuro"));
      atualizarRotulo(botao);
      try { localStorage.setItem(CHAVE_TEMA, temaSalvo); } catch (_) { /* armazenamento opcional */ }
    });
    atualizarRotulo(botao);
    document.body.appendChild(botao);
  };

  function atualizarRotulo(botao) {
    const escuro = document.documentElement.dataset.tema === "escuro";
    botao.innerHTML = escuro
      ? '<i class="bi bi-sun-fill" aria-hidden="true"></i><span>Tema claro</span>'
      : '<i class="bi bi-moon-stars-fill" aria-hidden="true"></i><span>Tema escuro</span>';
    botao.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
    botao.title = escuro ? "Ativar tema claro" : "Ativar tema escuro";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", criarBotao, { once: true });
  else criarBotao();
})();
