document.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacao();
  document.getElementById("form-fornecedor")?.addEventListener("submit", salvarFornecedor);
  document.getElementById("modalFornecedor")?.addEventListener("hidden.bs.modal", resetarModalFornecedor);
  carregarFornecedores();
});

async function carregarFornecedores() {
  const tabela = document.getElementById("tabela-fornecedores");
  if (!tabela) return;
  tabela.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Carregando fornecedores...</td></tr>';
  try {
    const resposta = await fetchAutenticado("/fornecedor");
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(resultado.mensagem || "Não foi possível carregar fornecedores.");
    }
    const fornecedores = Array.isArray(resultado.dados)
      ? resultado.dados
      : Array.isArray(resultado) ? resultado : [];
    window.fornecedores = fornecedores;
    tabela.innerHTML = fornecedores.length
      ? fornecedores.map((item) => `<tr>
          <td class="ps-3 fw-bold text-muted small">${escapar(item.cnpj)}</td>
          <td class="fw-bold">${escapar(item.nome)}</td>
          <td>${escapar(item.telefone)}</td>
          <td>${escapar(item.email)}</td>
          <td class="text-end pe-3"><div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="editarFornecedor(${Number(item.id_fornecedor)})"><i class="bi bi-pencil me-1"></i>Editar</button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="excluirFornecedor(${Number(item.id_fornecedor)})"><i class="bi bi-trash me-1"></i>Excluir</button>
          </div></td>
        </tr>`).join("")
      : '<tr><td colspan="5" class="text-center py-4 text-muted">Nenhum fornecedor cadastrado.</td></tr>';
  } catch (erro) {
    console.error("Erro ao carregar fornecedores:", erro);
    tabela.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">${escapar(erro.message)}</td></tr>`;
  }
}

function editarFornecedor(id) {
  const fornecedor = (window.fornecedores || []).find((item) => Number(item.id_fornecedor) === Number(id));
  if (!fornecedor) {
    return carregarFornecedores().then(() => mostrarAviso("Atualizei a lista; tente abrir a edição novamente.", "aviso"));
  }
  document.getElementById("fornecedor-id").value = fornecedor.id_fornecedor;
  document.getElementById("fornecedor-nome").value = fornecedor.nome || "";
  document.getElementById("fornecedor-cnpj").value = formatarCnpj(fornecedor.cnpj);
  document.getElementById("fornecedor-telefone").value = formatarTelefone(fornecedor.telefone);
  document.getElementById("fornecedor-email").value = fornecedor.email || "";
  document.getElementById("titulo-modal-fornecedor").textContent = "Editar fornecedor";
  document.getElementById("btn-salvar-fornecedor").textContent = "Salvar alterações";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modalFornecedor")).show();
}

async function salvarFornecedor(evento) {
  evento.preventDefault();
  const form = evento.currentTarget;
  const botao = document.getElementById("btn-salvar-fornecedor");
  const id = document.getElementById("fornecedor-id").value;
  const dados = {
    nome: document.getElementById("fornecedor-nome").value.trim(),
    cnpj: document.getElementById("fornecedor-cnpj").value.replace(/\D/g, ""),
    telefone: document.getElementById("fornecedor-telefone").value.replace(/\D/g, ""),
    email: document.getElementById("fornecedor-email").value.trim(),
  };
  if (dados.cnpj.length < 11 || dados.cnpj.length > 14) {
    mostrarMensagemFornecedor("Informe um CNPJ válido com 11 a 14 números.", "danger");
    return;
  }
  if (dados.telefone.length < 10 || dados.telefone.length > 13) {
    mostrarMensagemFornecedor("Informe um telefone válido com DDD.", "danger");
    return;
  }
  botao.disabled = true;
  const textoOriginal = botao.textContent;
  botao.textContent = "Salvando...";
  try {
    const resposta = await fetchAutenticado(id ? `/fornecedor/${encodeURIComponent(id)}` : "/fornecedor", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(dados),
    });
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(resultado.mensagem || `Não foi possível ${id ? "editar" : "cadastrar"} o fornecedor.`);
    }
    const modal = document.getElementById("modalFornecedor");
    bootstrap.Modal.getInstance(modal)?.hide();
    await carregarFornecedores();
    mostrarMensagemFornecedor(id ? "Fornecedor atualizado com sucesso." : "Fornecedor cadastrado com sucesso.", "success");
  } catch (erro) {
    console.error("Erro ao salvar fornecedor:", erro);
    mostrarMensagemFornecedor(erro.message || "Não foi possível salvar o fornecedor.", "danger");
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

function resetarModalFornecedor() {
  document.getElementById("form-fornecedor")?.reset();
  document.getElementById("fornecedor-id").value = "";
  document.getElementById("titulo-modal-fornecedor").textContent = "Cadastrar fornecedor";
  document.getElementById("btn-salvar-fornecedor").textContent = "Salvar fornecedor";
}

async function excluirFornecedor(id) {
  if (!confirm("Excluir este fornecedor? Produtos vinculados podem impedir a exclusão.")) return;
  try {
    const resposta = await fetchAutenticado(`/fornecedor/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!resposta) return;
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) throw new Error(resultado.mensagem || "Não foi possível excluir.");
    await carregarFornecedores();
    mostrarAviso("Fornecedor excluído.", "sucesso");
  } catch (erro) {
    mostrarAviso(erro.message || "Não foi possível excluir.");
  }
}

function mostrarMensagemFornecedor(texto, tipo) {
  mostrarAviso(texto, tipo === "success" ? "sucesso" : tipo === "warning" ? "aviso" : "erro");
}

function formatarCnpj(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  if (digitos.length === 14) return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  if (digitos.length === 11) return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  return valor || "";
}

function formatarTelefone(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  if (digitos.length === 11) return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (digitos.length === 10) return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return valor || "";
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caractere],
  );
}
