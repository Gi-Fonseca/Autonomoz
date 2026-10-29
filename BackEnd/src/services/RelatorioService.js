const RelatorioRepository = require("../repositories/RelatorioRepository");

class RelatorioService {
  async estoque() {
    const relatorio = await RelatorioRepository.estoque();
    return {
      sucesso: true,
      gerado_em: new Date().toISOString(),
      dados: relatorio,
    };
  }
}

module.exports = new RelatorioService();
