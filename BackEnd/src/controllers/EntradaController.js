const EntradaRepository = require("../repositories/EntradaRepository");

function erroHttp(erro, res) {
  return res.status(erro.status || 500).json({
    sucesso: false,
    mensagem: erro.mensagem || erro.message || "Erro ao processar a entrada.",
  });
}

function validarMotivo(valor) {
  const motivo = typeof valor === "string" ? valor.trim() : "";
  if (!motivo) {
    throw Object.assign(new Error("O motivo da entrada é obrigatório."), {
      status: 400,
    });
  }
  if (motivo.length > 255) {
    throw Object.assign(
      new Error("O motivo da entrada deve ter no máximo 255 caracteres."),
      { status: 400 },
    );
  }
  return motivo;
}

function validarInteiroPositivo(valor, nome) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw Object.assign(new Error(`${nome} deve ser um inteiro maior que zero.`), {
      status: 400,
    });
  }
  return numero;
}

class EntradaController {
  async listar(req, res) {
    try {
      const dados = await EntradaRepository.listar();
      return res.status(200).json({ sucesso: true, dados, total: dados.length });
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }

  async buscarPorId(req, res) {
    try {
      const dados = await EntradaRepository.buscarPorId(req.params.id);
      return res.status(200).json({ sucesso: true, dados });
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }

  async cadastrar(req, res) {
    try {
      const corpo = req.body || {};
      const dados = {
        ...corpo,
        id_produto: validarInteiroPositivo(corpo.id_produto, "Produto"),
        id_funcionario: req.usuario.id,
        quantidade: validarInteiroPositivo(corpo.quantidade, "Quantidade"),
        data_entrada: corpo.data_entrada || new Date(),
        valor_compra: Number(corpo.valor_compra || 0),
        nf: corpo.nf || null,
        fornecedor: corpo.fornecedor || null,
        motivo_entrada: validarMotivo(corpo.motivo_entrada),
      };
      const dadosCriados = await EntradaRepository.cadastrar(dados);
      return res.status(201).json({
        sucesso: true,
        mensagem: "Entrada registrada com sucesso.",
        dados: dadosCriados,
      });
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }

  async atualizar(req, res) {
    try {
      const corpo = { ...(req.body || {}) };
      if (Object.hasOwn(corpo, "motivo_entrada")) {
        corpo.motivo_entrada = validarMotivo(corpo.motivo_entrada);
      }
      delete corpo.id_funcionario;
      const dados = await EntradaRepository.atualizar(req.params.id, corpo);
      return res.status(200).json({
        sucesso: true,
        mensagem: "Entrada atualizada com sucesso.",
        dados,
      });
    } catch (erro) {
      return erroHttp(erro, res);
    }
  }
}

module.exports = new EntradaController();
