// js/produto-cadas.js
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacao();
    await carregarSelects();
});

async function carregarSelects() {
    try {
        const [resCat, resFor] = await Promise.all([
            fetchAutenticado('/categoria'),
            fetchAutenticado('/fornecedor')
        ]);

        if (resCat) {
            const categorias = await resCat.json();
            const selectCat = document.getElementById('prod-categoria');
            selectCat.innerHTML = '';
            categorias.forEach(c => {
                selectCat.innerHTML += `<option value="${c.id_categoria}">${c.tipo_produto}</option>`;
            });
        }

        if (resFor) {
            const fornecedores = await resFor.json();
            const selectFor = document.getElementById('prod-fornecedor');
            selectFor.innerHTML = '';
            fornecedores.forEach(f => {
                selectFor.innerHTML += `<option value="${f.id_fornecedor}">${f.nome}</option>`;
            });
        }
    } catch (err) {
        console.error('Erro ao carregar seletores:', err);
    }
}

document.getElementById('formProdutoCompleto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nome: document.getElementById('prod-nome').value,
        quantidade: document.getElementById('prod-qtd').value,
        id_categoria: document.getElementById('prod-categoria').value,
        id_fornecedor: document.getElementById('prod-fornecedor').value,
        status: 'Ativo'
    };

    try {
        const res = await fetchAutenticado('/produto', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            alert('Produto cadastrado com sucesso!');
            window.location.href = 'inventario.html';
        }
    } catch (err) {
        alert('Erro ao salvar produto.');
    }
});