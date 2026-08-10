// utils/base64Helper.js
const fs = require('fs'); // Biblioteca para lidar com arquivos no computador
const path = require('path'); // Biblioteca para organizar caminhos de pastas

function salvarFotoBase64(base64, uploadDir) {
    // 1. Verifica se o texto recebido é realmente uma foto em Base64
    const matches = base64.match(
        /^data:(image\/\w+);base64,(.+)$/
    );
    
    if (!matches) {
        throw new Error('Base64 inválido'); // Avisa se o texto estiver errado
    }

    // 2. Descobre se a foto é JPG, PNG, etc.
    const extensao = matches[1].split('/')[1];
    const dados = matches[2]; // Pega apenas a parte da foto, sem o "texto de aviso"

    // 3. Cria um nome único usando a data e hora atual para não repetir
    const nomeArquivo = `${Date.now()}.${extensao}`;
    
    // 4. Define o caminho completo: Pasta de Uploads + Nome do Arquivo
    const caminhoArquivo = path.join(
        uploadDir,
        nomeArquivo
    );

    // 5. Salva a foto fisicamente na pasta, transformando o texto em imagem
    fs.writeFileSync(
        caminhoArquivo,
        dados,
        'base64'
    );

    return nomeArquivo; // Devolve o nome da foto para salvarmos no banco de dados
}

module.exports = {
    salvarFotoBase64
};