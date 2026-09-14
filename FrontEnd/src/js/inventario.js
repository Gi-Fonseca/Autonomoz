// js/inventario.js - Integração Real com o Back-end

document.addEventListener('DOMContentLoaded', () => {
    carregarInventario();
});

// 1. BUSCAR PRODUTOS DO BACK-END (GET /api/produtos)
async function carregarInventario() {
    const tbody = document.getElementById('tabela-inventario');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4 text-muted">
                <div class="spinner-border text-danger spinner-border-sm me-2" role="status"></div>
                Carregando inventário do servidor...
            </td>
        </tr>
    `;

    try {
        const produtos = await apiFetch('/produtos');
        renderizarTabela(produtos);
    } catch (erro) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger fw-bold">
                    ⚠️ Não foi possível conectar ao Back-end. Verifique se o servidor está rodando.
                </td>
            </tr>
        `;
    }
}

// 2. RENDERIZAR TABELA COM DADOS VINDOS DA API
function renderizarTabela(produtos) {
    const tbody = document.getElementById('tabela-inventario');
    tbody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">Nenhum produto cadastrado no banco de dados.</td>
            </tr>
        `;
        return;
    }

    produtos.forEach(p => {
        const id = p.id || p.id_produto;
        const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco || 0);
        const badgeCat = p.categoria === 'VEICULO' || p.id_categoria == 2
            ? '<span class="badge bg-primary text-white">VEÍCULO</span>' 
            : '<span class="badge bg-secondary text-white">PEÇA</span>';

        tbody.innerHTML += `
            <tr>
                <td class="ps-3 fw-bold text-muted small">AMZ-${id}</td>
                <td class="fw-bold text-dark">${p.nome}</td>
                <td>${badgeCat}</td>
                <td class="fw-semibold text-secondary">${p.marca || 'Genérica'}</td>
                <td class="small text-muted">${p.modelo || 'Multimodelos'}</td>
                <td class="fw-bold text-dark">${preco}</td>
                <td>
                    <span class="badge bg-light text-dark border px-2 py-1 fs-6" id="qtd-${id}">
                        ${p.quantidade}
                    </span>
                </td>
                <td class="text-end pe-3">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success fw-bold" onclick="abrirModalMov(${id}, '${p.nome}', 'ENTRADA')">+ Entrada</button>
                        <button class="btn btn-outline-danger fw-bold" onclick="abrirModalMov(${id}, '${p.nome}', 'SAIDA')">- Saída</button>
                        <button class="btn btn-outline-secondary fw-bold" onclick="abrirModalMov(${id}, '${p.nome}', 'AJUSTE')">⚙️ Ajuste</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// 3. ABRIR MODAL
function abrirModalMov(id, nome, tipo) {
    document.getElementById('mov-produto-id').value = id;
    document.getElementById('mov-produto-nome').value = nome;
    document.getElementById('mov-tipo').value = tipo;
    
    const modalEl = new bootstrap.Modal(document.getElementById('modalMovimentacao'));
    modalEl.show();
}

// 4. CONFIRMAR E ENVIAR MOVIMENTAÇÃO AO BACK-END (POST /api/movimentacoes)
async function confirmarMovimentacao() {
    const produtoId = document.getElementById('mov-produto-id').value;
    const tipo = document.getElementById('mov-tipo').value;
    const quantidade = parseInt(document.getElementById('mov-qtd').value);
    const observacao = document.getElementById('mov-obs').value;

    if (!quantidade || quantidade <= 0) {
        alert("Informe uma quantidade válida!");
        return;
    }

    const payload = {
        produto_id: parseInt(produtoId),
        tipo: tipo, // 'ENTRADA', 'SAIDA' ou 'AJUSTE'
        quantidade: quantidade,
        observacao: observacao || 'Movimentação manual via painel'
    };

    try {
        const resultado = await apiFetch('/movimentacoes', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        alert(`✅ Movimentação registrada com sucesso! Novo Estoque: ${resultado.novoEstoque}`);
        
        // Esconde o Modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalMovimentacao'));
        modalInstance.hide();

        // Recarrega os dados atualizados da API
        carregarInventario();
    } catch (erro) {
        alert(`❌ Erro ao registrar movimentação: ${erro.message}`);
    }
}

// 5. FILTRO EM TEMPO REAL
function filtrarInventario() {
    const termo = document.getElementById('busca-inventario').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-inventario tr');
    linhas.forEach(l => {
        l.style.display = l.innerText.toLowerCase().includes(termo) ? '' : 'none';
    });
}