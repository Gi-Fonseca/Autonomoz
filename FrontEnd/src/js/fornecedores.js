document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  document
    .getElementById("form-fornecedor")
    ?.addEventListener("submit", cadastrarFornecedor);
  carregarFornecedores();
});

async function carregarFornecedores() {
  const tabela = document.getElementById("tabela-fornecedores");
  try {
    const resposta = await fetchAutenticado("/fornecedor");
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(
        resultado.mensagem || "Não foi possível carregar fornecedores.",
      );
    const dados = Array.isArray(resultado.dados) ? resultado.dados : resultado;
    const fornecedores = Array.isArray(dados) ? dados : [];
    tabela.innerHTML = fornecedores.length
      ? fornecedores
          .map(
            (item) =>
              `<tr><td class="ps-3 fw-bold text-muted small">${escapar(item.cnpj)}</td><td class="fw-bold">${escapar(item.nome)}</td><td>-</td><td>${escapar(item.telefone)}</td><td>${escapar(item.email)}</td><td class="text-end pe-3"><button class="btn btn-sm btn-outline-danger" onclick="excluirFornecedor(${item.id_fornecedor})">Excluir</button></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum fornecedor cadastrado.</td></tr>';
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">${escapar(erro.message)}</td></tr>`;
  }
}

async function cadastrarFornecedor(evento) {
  evento.preventDefault();
  const botao = evento.target.querySelector("button[type=submit]");
  const dados = {
    nome: document.getElementById("fornecedor-nome").value.trim(),
    cnpj: document.getElementById("fornecedor-cnpj").value.replace(/\D/g, ""),
    telefone: document
      .getElementById("fornecedor-telefone")
      .value.replace(/\D/g, ""),
    email: document.getElementById("fornecedor-email").value.trim(),
  };
  if (dados.cnpj.length < 11 || dados.cnpj.length > 14)
    return mostrarMensagemFornecedor(
      "Informe um CNPJ válido com 11 a 14 números.",
      "danger",
    );
  if (dados.telefone.length < 10)
    return mostrarMensagemFornecedor("Informe um telefone válido.", "danger");
  botao.disabled = true;
  try {
    const resposta = await fetchAutenticado("/fornecedor", {
      method: "POST",
      body: JSON.stringify(dados),
    });
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false)
      throw new Error(
        resultado.mensagem || "Não foi possível cadastrar fornecedor.",
      );
    evento.target.reset();
    await carregarFornecedores();
    const modal = document.getElementById("modalFornecedor");
    if (window.bootstrap?.Modal && modal)
      window.bootstrap.Modal.getInstance(modal)?.hide();
    mostrarMensagemFornecedor("Fornecedor cadastrado com sucesso.", "success");
  } catch (erro) {
    mostrarMensagemFornecedor(erro.message, "danger");
  } finally {
    botao.disabled = false;
  }
}

async function excluirFornecedor(id) {
  if (
    !confirm(
      "Excluir este fornecedor? Produtos vinculados podem impedir a exclusão.",
    )
  )
    return;
  const resposta = await fetchAutenticado(`/fornecedor/${id}`, {
    method: "DELETE",
  });
  const resultado = await resposta.json();
  if (!resposta.ok || resultado.sucesso === false)
    return alert(resultado.mensagem || "Não foi possível excluir.");
  carregarFornecedores();
}

function mostrarMensagemFornecedor(texto, tipo) {
  const elemento = document.getElementById("mensagem-fornecedor");
  elemento.textContent = texto;
  elemento.className = `alert alert-${tipo}`;
}
function escapar(valor) {
  return String(valor ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}
