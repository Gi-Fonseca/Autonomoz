// Configuração central da API e da autenticação.
// Se o frontend for aberto pelo backend, usa a mesma origem.
// Se for aberto pelo Live Server, Vite ou arquivo local, usa o backend local na porta 3000.
const API_URL = (() => {
  const configurada = window.localStorage.getItem("autonomoz_api_url");
  if (configurada) return configurada.replace(/\/$/, "");
  if (window.location.protocol === "http:" && window.location.port === "3000")
    return window.location.origin;
  if (window.location.protocol === "https:" && window.location.port !== "")
    return window.location.origin;
  return "http://localhost:3000";
})();

function salvarSessaoJWT(token, usuario) {
  localStorage.setItem("autonomoz_jwt", token);
  localStorage.setItem("autonomoz_usuario", JSON.stringify(usuario));
}
function obterTokenJWT() {
  return localStorage.getItem("autonomoz_jwt");
}
function obterUsuarioLogado() {
  const usuario = localStorage.getItem("autonomoz_usuario");
  try {
    return usuario ? JSON.parse(usuario) : null;
  } catch {
    return null;
  }
}
function verificarAutenticacao() {
  if (!obterTokenJWT()) window.location.href = "login.html";
}
function fazerLogout() {
  localStorage.removeItem("autonomoz_jwt");
  localStorage.removeItem("autonomoz_usuario");
  window.location.href = "login.html";
}

async function fetchAutenticado(endpoint, opcoes = {}) {
  const token = obterTokenJWT();
  const rota = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${rota}`;
  const headers = {
    Accept: "application/json",
    ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.headers || {}),
  };
  const resposta = await fetch(url, { ...opcoes, headers });
  if (resposta.status === 401 || resposta.status === 403) {
    fazerLogout();
    return null;
  }
  const contentType = resposta.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `A API não retornou JSON em ${rota}. Backend esperado: ${API_URL}. Inicie o backend na porta 3000.`,
    );
  }
  return resposta;
}
const apiFetch = fetchAutenticado;

function mostrarAviso(mensagem, tipo = "erro", duracao = 4500) {
  let aviso = document.getElementById("autonomoz-aviso");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "autonomoz-aviso";
    aviso.setAttribute("role", "status");
    document.body.appendChild(aviso);
  }
  const configuracao = {
    sucesso: { classe: "sucesso", icone: "✓" },
    erro: { classe: "erro", icone: "!" },
    aviso: { classe: "aviso", icone: "!" },
    info: { classe: "info", icone: "i" },
  }[tipo] || { classe: "erro", icone: "!" };
  aviso.className = `autonomoz-aviso autonomoz-aviso-${configuracao.classe}`;
  aviso.innerHTML = `<span class="autonomoz-aviso-icone">${configuracao.icone}</span><span class="autonomoz-aviso-texto"></span><button type="button" class="autonomoz-aviso-fechar" aria-label="Fechar aviso">×</button>`;
  aviso.querySelector(".autonomoz-aviso-texto").textContent = String(
    mensagem || "",
  );
  aviso.querySelector(".autonomoz-aviso-fechar").onclick = () =>
    aviso.classList.remove("visivel");
  requestAnimationFrame(() => aviso.classList.add("visivel"));
  clearTimeout(aviso._timer);
  aviso._timer = setTimeout(() => aviso.classList.remove("visivel"), duracao);
}
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}
function formatarData(dataIso) {
  if (!dataIso) return "-";
  try {
    if (typeof dataIso === "string") {
      const mysql = dataIso.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/,
      );
      if (mysql) {
        const [, ano, mes, dia, hora = "00", minuto = "00"] = mysql;
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
      }
    }
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime())) return String(dataIso);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return String(dataIso);
  }
}
