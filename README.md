# 🚘 Autonomoz - Sistema de Gerenciamento de Estoque

O **Autonomoz** é uma plataforma focada no gerenciamento e controle de estoque de veículos e peças automotivas. O sistema foi concebido para atender às necessidades operacionais de controle de entrada, saída, movimentação e controle de acessos por nível de usuário (Estoquista e Gerente).

---

## 🛠️ Tecnologias Utilizadas

### **Back-End (API REST)**
* **Node.js / Express**: Construção das rotas RESTful e regras de negócio.
* **VS Code**: Ambiente Integrado de Desenvolvimento (IDE).
* **Base URL Local**: `http://localhost:3000/api`


### **Gestão do Projeto**
* **Trello**: Organização ágil da equipe e controle de *dailys*.

---

## 🗄️ Entidades do Sistema

A modelagem relacional de dados conta com as seguintes entidades organizadas para garantir a rastreabilidade do estoque:

* **Funcionário**: Cadastro e autenticação de usuários (Campos: ID, Nome, Cargo, CPF, Email e Senha).
* **Produtos**: Cadastro dos itens comercializados (Campos: Marca, Nome, Quantidade e Categoria).
* **Categoria**: Classificação do item em peças ou veículos.
* **Entrada_produto**: Registro de compras e recebimentos com histórico fiscal (`Nf`).
* **Saida_produto**: Registro de vendas, perdas, devoluções ou ajustes de inventário.
* **Movimentação**: Tabela centralizada e auditável de eventos de entrada e saída.
* **Estoque**: Posição física acumulada, valor unitário e localização no galpão/loja.

---

## 🔌 Rotas da API REST (Observações de Arquitetura)

* **Regra de Integridade**: O método de exclusão física (`DELETE`) foi intencionalmente desabilitado para as tabelas de `Entrada_produto`, `Saida_produto`, `Movimentacao` e `Estoque`.
* **Justificativa Técnica**: Como as movimentações compõem o histórico operacional da empresa, o apagamento de registros comprometeria a rastreabilidade e a integridade. Correções de lançamentos incorretos devem ser realizadas via atualização do registro ou novo lançamento de ajuste.
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

---
