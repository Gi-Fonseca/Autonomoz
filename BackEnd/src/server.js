require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET ausente ou muito curta. Crie BackEnd/.env a partir de BackEnd/.env.example e defina uma chave com pelo menos 32 caracteres.",
  );
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
