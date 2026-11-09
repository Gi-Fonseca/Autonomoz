const RelatorioRepository = require("../repositories/RelatorioRepository");

class RelatorioService {
  async gerar(tipo) {
    const dados = await RelatorioRepository[tipo]();
    return {
      sucesso: true,
      dados: {
        ...dados,
        gerado_em: new Date().toISOString(),
      },
    };
  }

  async estoque() {
    return this.gerar("estoque");
  }

  async entradas() {
    return this.gerar("entradas");
  }

  async saidas() {
    return this.gerar("saidas");
  }

  async movimentacoes() {
    return this.gerar("movimentacoes");
  }
}

module.exports = new RelatorioService();
