require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite chamadas sem cabeçalho Origin, como o próprio frontend,
      // Postman e curl.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve o frontend estático pela mesma aplicação e pela mesma porta.
app.use(express.static(path.join(__dirname, "../../FrontEnd")));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Contrato único: sucesso, mensagem e dados.
// Nunca expõe stack ou erro interno na resposta ao cliente.
app.use((req, res, next) => {
  const jsonOriginal = res.json.bind(res);

  res.json = (payload) => {
    const statusErro = res.statusCode >= 400;

    if (statusErro) {
      if (payload && payload.erro) {
        console.error(payload.erro);
      }

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

      if (payload.total !== undefined) {
        normalizado.total = payload.total;
      }

      if (payload.id !== undefined && normalizado.dados === null) {
        normalizado.dados = { id: payload.id };
      }

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

// Rotas de API inexistentes devem responder JSON, nunca a página HTML padrão do Express.
app.use((req, res, next) => {
  if (req.path.startsWith("/relatorios")) {
    return res.status(404).json({
      sucesso: false,
      mensagem:
        "Rota de relatório não encontrada. Reinicie o backend atualizado.",
    });
  }
  return next();
});

module.exports = app;
