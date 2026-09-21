const jwt = require("jsonwebtoken");

function secret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }
  return process.env.JWT_SECRET;
}

function autenticar(req, res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");
  if (tipo !== "Bearer" || !token) {
    return res
      .status(401)
      .json({
        sucesso: false,
        mensagem: "Token de autenticação não informado",
      });
  }
  try {
    req.usuario = jwt.verify(token, secret(), { issuer: "autonomoz-api" });
    return next();
  } catch (erro) {
    return res
      .status(401)
      .json({
        sucesso: false,
        mensagem: "Token de autenticação inválido ou expirado",
      });
  }
}

function autorizar(...cargos) {
  return (req, res, next) => {
    if (!req.usuario || !cargos.includes(req.usuario.cargo)) {
      return res
        .status(403)
        .json({
          sucesso: false,
          mensagem: "Acesso não autorizado para este perfil",
        });
    }
    return next();
  };
}

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    },
    secret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      issuer: "autonomoz-api",
    },
  );
}

module.exports = { autenticar, autorizar, gerarToken };
