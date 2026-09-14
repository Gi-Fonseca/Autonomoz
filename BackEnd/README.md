# 🚘 Autonomoz - Sistema de Gerenciamento de Estoque

O **Autonomoz** é uma plataforma focada no gerenciamento e controle de estoque de veículos e peças automotivas. O sistema foi concebido para atender às necessidades operacionais de controle de entrada, saída, movimentação e controle de acessos por nível de usuário (Estoquista e Gerente).

---

## 🛠️ Tecnologias Utilizadas

### **Back-End (API REST)**
* **Node.js / Express**: Construção das rotas RESTful e regras de negócio.
* **MySQL**: Banco de dados relacional.
* **VS Code**: Ambiente Integrado de Desenvolvimento (IDE).
* **Base URL Local**: `http://localhost:3000`

### **Front-End**
* **HTML, CSS, JavaScript e Bootstrap 5**
* **Fetch API** para consumo do backend

### **Gestão do Projeto**
* **Trello**: Organização ágil da equipe e controle de *dailys*.

---

## 🗄️ Entidades do Sistema

* **Funcionário**: Cadastro e autenticação de usuários (Campos: id, cargo, nome, cpf, email, senha).
* **Cliente**: Destino das saídas de estoque (Campos: id_cliente, nome, email, cadastro).
* **Categoria**: Classificação do item em peças ou veículos (Campos: id_categoria, tipo_produto).
* **Fornecedor**: Empresas que fornecem peças e veículos (Campos: id_fornecedor, nome, cnpj, telefone, email).
* **Produtos**: Cadastro dos itens comercializados (Campos: id_produto, nome, quantidade, validade, id_categoria, id_fornecedor, status). *Sem campo marca — o fornecedor cumpre esse papel via id_fornecedor.*
* **Entrada_produto**: Registro de compras e recebimentos com histórico fiscal (`nf`).
* **Saida_produto**: Registro de vendas, perdas, devoluções ou transferências.
* **Ajuste_produto**: Registro de ajustes de mercadoria (quebra, troca, defeito).
* **Movimentação**: Tabela centralizada e auditável de eventos de entrada, saída e ajuste.
* **Lote**: Agrupamento de quantidade de produtos recebidos.
* **Estoque**: Posição física acumulada, valor unitário e localização no galpão/loja.

---

## 🔌 Rotas da API REST (Observações de Arquitetura)

* **Regra de Integridade**: O método de exclusão física (`DELETE`) foi intencionalmente desabilitado para as tabelas de `Produtos`, `Entrada_produto`, `Saida_produto`, `Movimentacao`, `Ajuste_produto`, `Lote` e `Estoque`.
* **Justificativa Técnica**: Como essas tabelas compõem o histórico operacional da empresa, o apagamento de registros comprometeria a rastreabilidade e a integridade. Correções de lançamentos incorretos devem ser realizadas via atualização do registro ou novo lançamento de ajuste.

---

## 🖼️ Upload de imagem de produto (em progresso)

O produto poderá futuramente receber uma foto enviada em base64. Essa funcionalidade ainda está sendo implementada no backend — falta definir e implementar:
1. Coluna de imagem na tabela `produtos` (ou salvar arquivo na pasta `uploads/` e guardar o caminho).
2. Leitura do campo `imagem` no controller de POST/PUT de produto.
3. Rota estática para servir arquivos de `uploads/`, se essa for a estratégia escolhida.
4. Aumento do limite de tamanho do body do Express (`express.json({ limit: '5mb' })`).
5. Inclusão do campo no retorno do GET.

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Servidor (Back-End)
Execute o comando abaixo na raiz do projeto back-end para iniciar a API com recarregamento automático a cada alteração de código:

```bash
node --watch ./src/server.js
```

---

## 🔌 Integrantes do Grupo

Giovana Lays Coelho Fonseca </br>
Letícia Roberta Oliveira Souto </br>
Rafael Teixeira </br>
Victória Marques </br>