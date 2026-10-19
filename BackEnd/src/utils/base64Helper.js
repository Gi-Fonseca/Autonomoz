const fs = require("fs");
const path = require("path");

/**
 * Decodifica uma string Base64 e salva o arquivo na pasta BackEnd/uploads.
 * Exemplo aceito: data:image/jpeg;base64,/9j/4AAQSk...
 *
 * @param {string} base64String
 * @returns {string|null} Nome do arquivo salvo.
 */
function salvarImagemBase64(base64String) {
  if (!base64String) {
    return null;
  }

  const matches = base64String.match(
    /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i,
  );

  if (!matches || matches.length !== 3) {
    throw new Error("Formato de imagem Base64 inválido.");
  }

  const extensao = matches[1].toLowerCase().replace("jpeg", "jpg");
  const conteudoBase64 = matches[2];
  const bufferDados = Buffer.from(conteudoBase64, "base64");

  if (!bufferDados.length) {
    throw new Error("Imagem Base64 vazia ou inválida.");
  }

  const caminhoPasta = path.join(__dirname, "../../uploads");

  if (!fs.existsSync(caminhoPasta)) {
    fs.mkdirSync(caminhoPasta, { recursive: true });
  }

  const nomeArquivo = `img-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extensao}`;

  fs.writeFileSync(path.join(caminhoPasta, nomeArquivo), bufferDados);

  return nomeArquivo;
}

// Mantém compatibilidade com o nome usado anteriormente pelo controller.
const salvarFotoBase64 = salvarImagemBase64;

module.exports = {
  salvarImagemBase64,
  salvarFotoBase64,
};
