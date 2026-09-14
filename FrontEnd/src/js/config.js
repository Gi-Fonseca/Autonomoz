// js/config.js - Configuração Central e Autenticação (AutoNoMoz)

// Endereço base do servidor Back-end
const API_URL = 'http://localhost:3000';

/**
 * Salva o token JWT e os dados do usuário no LocalStorage
 */
function salvarSessaoJWT(token, usuario) {
    localStorage.setItem('autonomoz_jwt', token);
    localStorage.setItem('autonomoz_usuario', JSON.stringify(usuario));
}

/**
 * Recupera o Token JWT ativo
 */
function obterTokenJWT() {
    return localStorage.getItem('autonomoz_jwt');
}

/**
 * Recupera os dados do usuário logado
 */
function obterUsuarioLogado() {
    const usuario = localStorage.getItem('autonomoz_usuario');
    return usuario ? JSON.parse(usuario) : null;
}

/**
 * Protege a página: Redireciona para login.html caso não esteja autenticado
 */
function verificarAutenticacao() {
    const token = obterTokenJWT();
    if (!token) {
        window.location.href = 'login.html';
    }
}

/**
 * Encerra a sessão e limpa o armazenamento local
 */
function fazerLogout() {
    localStorage.removeItem('autonomoz_jwt');
    localStorage.removeItem('autonomoz_usuario');
    window.location.href = 'login.html';
}

/**
 * Helper principal para requisições HTTP autenticadas com o Back-end
 */
async function fetchAutenticado(endpoint, opcoes = {}) {
    const token = obterTokenJWT();

    // Garante a formatação correta da barra na URL
    const rota = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${rota}`;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...opcoes.headers
    };

    try {
        const resposta = await fetch(url, { ...opcoes, headers });

        // Se o token for inválido ou expirar, desloga automaticamente
        if (resposta.status === 401 || resposta.status === 403) {
            console.warn('⚠️ Sessão expirada ou não autorizada.');
            fazerLogout();
            return null;
        }

        return resposta;
    } catch (erro) {
        console.error(`❌ Erro ao conectar com o Back-end em ${url}:`, erro);
        throw erro;
    }
}

/**
 * Alias de compatibilidade (para funções que chamarem apiFetch)
 */
const apiFetch = fetchAutenticado;

/**
 * Formata valores numéricos para Moeda Real (R$)
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

/**
 * Formata datas do padrão ISO do banco para PT-BR (DD/MM/AAAA HH:mm)
 */
function formatarData(dataIso) {
    if (!dataIso) return '-';
    try {
        const data = new Date(dataIso);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dataIso;
    }
}