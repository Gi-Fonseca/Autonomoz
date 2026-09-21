function traduzirErroBanco(
  erro,
  mensagemPadrao = "Não foi possível concluir a operação",
) {
  if (erro && (erro.errno === 1451 || erro.code === "ER_ROW_IS_REFERENCED_2")) {
    const negocio = new Error(
      "Não é possível excluir: existem registros vinculados a este cadastro",
    );
    negocio.status = 409;
    negocio.mensagem = negocio.message;
    return negocio;
  }
  if (erro && !erro.mensagem) erro.mensagem = mensagemPadrao;
  return erro;
}
module.exports = { traduzirErroBanco };
