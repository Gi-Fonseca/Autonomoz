const express = require("express");
const cors = require("cors");
const path = require("path");



const app = express();
const routes = require("./src/routes/index");

console.log("ROTAS CARREGADAS");

// Permite requisições de outros sistemas (Front-End)
app.use(cors());


// ========================== BASE64 / IMAGENS ==========================

// Permite receber JSON com imagens Base64
// Limite aumentado porque imagens podem ser grandes
app.use(express.json({
    limit: "10mb"
}));


// Permite receber dados de formulários
app.use(express.urlencoded({
    limit: "10mb",
    extended: true
}));


// Libera acesso público à pasta de imagens
// Exemplo:
// http://localhost:3000/uploads/foto.png
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "..", "uploads")
    )
);


// ========================== ROTAS ==========================

// Todas as rotas da aplicação
app.use("/", routes);


module.exports = app;
