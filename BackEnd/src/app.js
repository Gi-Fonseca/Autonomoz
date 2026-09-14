const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// CORRIGIDO: app.js já está dentro de src, então chamamos ./routes direto
const routes = require("./routes");

console.log("ROTAS CARREGADAS");

// Permite requisições de outros sistemas (Front-End)
app.use(cors());

// ========================== BASE64 / IMAGENS ==========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Libera acesso público à pasta de imagens
app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
);

// ========================== ROTAS ==========================
app.use("/", routes);

module.exports = app;