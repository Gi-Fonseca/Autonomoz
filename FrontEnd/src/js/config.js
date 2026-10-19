// Configuração central da API e da autenticação.
// Como o Express serve o frontend, usamos a mesma origem da página.
const API_URL = window.location.origin;

function salvarSessaoJWT(token, usuario) {
  localStorage.setItem("autonomoz_jwt", token);
  localStorage.setItem("autonomoz_usuario", JSON.stringify(usuario));
}

function obterTokenJWT() {
  return localStorage.getItem("autonomoz_jwt");
}

function obterUsuarioLogado() {
  const usuario = localStorage.getItem("autonomoz_usuario");
  return usuario ? JSON.parse(usuario) : null;
}

function verificarAutenticacao() {
  const token = obterTokenJWT();

  if (!token) {
    window.location.href = "login.html";
  }
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

  try {
    const resposta = await fetch(url, {
      ...opcoes,
      headers,
    });

    if (resposta.status === 401 || resposta.status === 403) {
      fazerLogout();
      return null;
    }

    return resposta;
  } catch (erro) {
    console.error(`Erro ao conectar ao backend em ${url}:`, erro);
    throw erro;
  }
}

const apiFetch = fetchAutenticado;

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}

function formatarData(dataIso) {
  if (!dataIso) return "-";

  try {
    return new Date(dataIso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dataIso;
  }
}
