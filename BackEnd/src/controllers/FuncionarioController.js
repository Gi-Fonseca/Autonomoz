const FuncionarioService = require("../services/FuncionarioService");
const { salvarFotoBase64 } = require("../utils/base64Helper");

class FuncionarioController {
  async login(req, res) {
    try {
      const { email, senha, cargo } = req.body || {};

      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "E-mail e senha são obrigatórios",
        });
      }

      if (!cargo) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Selecione o cargo Gerente ou Estoquista.",
        });
      }

      return res.json(await FuncionarioService.login(email, senha, cargo));
    } catch (erro) {
      console.error("[LOGIN] Falha ao consultar autenticação:", erro);
      let mensagem = erro.mensagem || "Erro ao realizar login";

      if (["ECONNREFUSED", "PROTOCOL_CONNECTION_LOST", "ETIMEDOUT"].includes(erro.code)) {
        mensagem = "Banco de dados indisponível. Verifique se o MySQL está iniciado.";
      } else if (["ER_NO_SUCH_TABLE", "ER_BAD_FIELD_ERROR"].includes(erro.code)) {
        mensagem = "Banco de dados desatualizado. Execute o arquivo database.sql novamente.";
      } else if (erro.code === "ER_ACCESS_DENIED_ERROR") {
        mensagem = "Acesso ao banco de dados negado. Verifique DB_USER e DB_PASSWORD.";
      } else if (erro.code === "ER_BAD_DB_ERROR") {
        mensagem = "O banco autonomoz_db não existe. Execute o database.sql.";
      }

      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem,
      });
    }
  }

  async solicitarReset(req, res) {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ sucesso: false, mensagem: "Informe o e-mail cadastrado." });
      return res.json(await FuncionarioService.solicitarReset(email));
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || "Não foi possível solicitar a recuperação." });
    }
  }

  async resetarSenha(req, res) {
    try {
      const { email, codigo, novaSenha } = req.body || {};
      return res.json(await FuncionarioService.resetarSenha(email, codigo, novaSenha));
    } catch (erro) {
      return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || "Não foi possível redefinir a senha." });
    }
  }

  async listar(req, res) {
    try {
      const resultado = await FuncionarioService.listar();
      return res.json(resultado);
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno do servidor",
        erro: erro.stack || erro,
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await FuncionarioService.buscarPorId(req.params.id);
      return res.json(resultado);
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro interno do servidor",
      });
    }
  }

  async cadastrar(req, res) {
    try {
      const dadosFuncionario = req.body || {};

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Requisição sem corpo. Verifique Content-Type e o payload JSON.",
        });
      }

      if (!dadosFuncionario.foto && dadosFuncionario.fotoBase64) {
        try {
          dadosFuncionario.foto = salvarFotoBase64(
            dadosFuncionario.fotoBase64,
          );
          delete dadosFuncionario.fotoBase64;
        } catch (erroFoto) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "fotoBase64 inválida",
            erro: erroFoto.message || erroFoto,
          });
        }
      }

      const resultado = await FuncionarioService.cadastrar(dadosFuncionario);
      return res.status(201).json(resultado);
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao cadastrar funcionário",
        erro: erro.stack || erro,
      });
    }
  }

  async atualizar(req, res) {
    try {
      const dadosFuncionario = req.body || {};

      if (!dadosFuncionario.foto && dadosFuncionario.fotoBase64) {
        try {
          dadosFuncionario.foto = salvarFotoBase64(
            dadosFuncionario.fotoBase64,
          );
          delete dadosFuncionario.fotoBase64;
        } catch (erroFoto) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "fotoBase64 inválida",
            erro: erroFoto.message || erroFoto,
          });
        }
      }

      const resultado = await FuncionarioService.atualizar(
        req.params.id,
        dadosFuncionario,
      );

      return res.json(resultado);
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao atualizar funcionário",
        erro: erro.stack || erro,
      });
    }
  }

  async deletar(req, res) {
    try {
      const resultado = await FuncionarioService.deletar(req.params.id);
      return res.json(resultado);
    } catch (erro) {
      return res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.mensagem || "Erro ao deletar funcionário",
      });
    }
  }
}

module.exports = new FuncionarioController();
