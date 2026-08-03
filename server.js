const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
