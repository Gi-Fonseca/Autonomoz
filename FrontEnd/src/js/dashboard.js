// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resposta = await fetch(`${API_URL}/produto`);
        if (!resposta.ok) return;

        const produtos = await resposta.json();
        
        // Atualiza indicadores
        document.querySelector('#dash-total-itens').innerText = produtos.length;
        
        // Conta alertas de estoque crítico (quantidade <= 5 por exemplo)
        const criticos = produtos.filter(p => p.quantidade <= 5).length;
        document.querySelector('#dash-alertas').innerText = criticos;

        // Preenche últimas entradas na tabela
        const tbody = document.querySelector('#tabela-recentes');
        tbody.innerHTML = '';

        produtos.slice(0, 5).forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>#${p.id_produto}</td>
                    <td class="fw-bold">${p.nome}</td>
                    <td>${p.id_fornecedor || 'Fornecedor Padrão'}</td>
                    <td><span class="badge bg-success-subtle text-success">+${p.quantidade} un</span></td>
                    <td>${formatarData(p.validade)}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar Dashboard:", err);
    }
});