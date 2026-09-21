const LoteRepository = require("../repositories/LoteRepository");

class LoteService {
  // Lista lotes
  async listar() {
    return await LoteRepository.listar();
  }

  // Busca lote
  async buscarPorId(id) {
    return await LoteRepository.buscarPorId(id);
  }

  // Valida lote
  async criar(dados) {
    if (dados.quantidade === undefined) {
      throw {
        status: 400,
        mensagem: "A quantidade é obrigatória",
      };
    }

    if (dados.quantidade < 0) {
      throw {
        status: 400,
        mensagem: "A quantidade não pode ser negativa",
      };
    }

    const id = await LoteRepository.criar(dados);

    return {
      id_lote: id,
      quantidade: dados.quantidade,
    };
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      throw {
        status: 400,
        mensagem: "ID inválido",
      };
    }

    if (dados.quantidade === undefined) {
      throw {
        status: 400,
        mensagem: "A quantidade é obrigatória",
      };
    }

    if (isNaN(dados.quantidade) || dados.quantidade < 0) {
      throw {
        status: 400,
        mensagem: "A quantidade não pode ser negativa",
      };
    }

    const lote = await LoteRepository.buscarPorId(id);

    if (!lote) {
      throw {
        status: 404,
        mensagem: "Lote não encontrado",
      };
    }

    const alterado = await LoteRepository.atualizar(id, dados);

    return {
      id_lote: Number(id),
      alterado,
    };
  }

  async excluir(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            }
        }

        const lote = await LoteRepository.buscarPorId(id)

        if (!lote) {
            throw {
                status: 404,
                mensagem: 'Lote não encontrado'
            }
        }

        const emUso = await LoteRepository.contarEstoquePorLote(id)

        if (emUso > 0) {
            throw {
                status: 409,
                mensagem: 'Lote não pode ser excluído: possui registros de estoque vinculados'
            }
        }

        await LoteRepository.excluir(id)

        return {
            sucesso: true,
            mensagem: 'Lote excluído com sucesso'
        }
    }
}

module.exports = new LoteService();
