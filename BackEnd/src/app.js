const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Contrato único: sucesso, mensagem e dados. Nunca expõe stack/erro interno.
app.use((req, res, next) => {
  const jsonOriginal = res.json.bind(res);
  res.json = (payload) => {
    const statusErro = res.statusCode >= 400;
    if (statusErro) {
      if (payload && payload.erro) console.error(payload.erro);
      return jsonOriginal({
        sucesso: false,
        mensagem:
          (payload && (payload.mensagem || payload.message)) ||
          "Erro ao processar a requisição",
      });
    }
    if (payload && payload.sucesso !== undefined) {
      const normalizado = {
        sucesso: Boolean(payload.sucesso),
        mensagem: payload.mensagem || null,
        dados: payload.dados !== undefined ? payload.dados : null,
      };
      if (payload.total !== undefined) normalizado.total = payload.total;
      if (payload.id !== undefined && normalizado.dados === null)
        normalizado.dados = { id: payload.id };
      return jsonOriginal(normalizado);
    }
    return jsonOriginal({
      sucesso: true,
      mensagem: null,
      dados: payload === undefined ? null : payload,
    });
  };
  next();
});
app.use("/", routes);
module.exports = app;
