// src/utils/uploadBase64.js
const fs = require('fs');
const path = require('path');

/**
 * Decodifica uma string Base64 e salva como arquivo físico na pasta uploads/
 * @param {string} base64String - Ex: "data:image/jpeg;base64,/9j/4AAQSk..."
 * @returns {string|null} - Retorna o nome do arquivo gerado
 */
function salvarFotoBase64(base64String) {
    if (!base64String) return null;

    // Extrai a extensão (png, jpeg, webp) e o conteúdo em bytes
    const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('Formato de imagem Base64 inválido.');
    }

    const extensao = matches[1];
    const bufferDados = Buffer.from(matches[2], 'base64');

    // Gera um nome único (ex: img-1726317600000.png)
    const nomeArquivo = `img-${Date.now()}.${extensao}`;
    
    // Caminho da pasta uploads na raiz do BackEnd
    const caminhoPasta = path.join(__dirname, '../../uploads');

    // Garante que a pasta uploads existe
    if (!fs.existsSync(caminhoPasta)) {
        fs.mkdirSync(caminhoPasta, { recursive: true });
    }

    // Grava o arquivo no disco
    fs.writeFileSync(path.join(caminhoPasta, nomeArquivo), bufferDados);

    return nomeArquivo;
}

module.exports = { salvarFotoBase64 };