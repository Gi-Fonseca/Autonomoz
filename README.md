# 🚘 Autonomoz - Sistema de Gerenciamento de Estoque

O **Autonomoz** é uma plataforma focada no gerenciamento e controle de estoque de veículos e peças automotivas. O sistema atende ao controle de entrada, saída, movimentação e acesso de usuários pelos níveis **Estoquista** e **Gerente**.

---

## 🛠️ Tecnologias Utilizadas

### **Back-End (API REST)**

- **Node.js / Express**: construção das rotas RESTful e regras de negócio.

- **MySQL**: banco de dados relacional.

- **JWT**: autenticação dos usuários.

- **Bcrypt**: proteção das senhas armazenadas.

- **Base URL Local**: `http://localhost:3000`

### **Front-End**

- **HTML, CSS, JavaScript e Bootstrap 5**

- **Fetch API** para consumo do backend

### **Gestão do Projeto**

- **Trello**: organização ágil da equipe e controle de *dailys*.

---

## 🗄️ Entidades do Sistema

- **Funcionário**: cadastro e autenticação de usuários (id, cargo, nome, cpf, email e senha ).

- **Cliente**: destino das saídas de estoque (id_cliente, nome, email e cadastro).

- **Categoria**: classificação dos produtos (id_categoria e tipo_produto).

- **Fornecedor**: empresas que fornecem peças e veículos.

- **Produto**: itens comercializados, com quantidade, validade, categoria, fornecedor e status.

- **Entrada_produto**: registro de compras e recebimentos com histórico fiscal.

- **Saida_produto**: registro de vendas, perdas, devoluções ou transferências.

- **Ajuste_produto**: registro de ajustes de mercadoria, como quebra, troca ou defeito.

- **Movimentação**: registro centralizado de entradas, saídas e ajustes.

- **Lote**: agrupamento da quantidade de produtos recebidos.

- **Estoque**: posição física acumulada, valor unitário e localização.

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)**.

A rota de login é:

```
POST /funcionario/login
```

Exemplo de corpo:

```json
{
  "email": "email@exemplo.com",
  "senha": "sua_senha"
}
```

Após o login, a API retorna um token. Esse token deve ser enviado nas outras requisições usando o cabeçalho:

```
Authorization: Bearer SEU_TOKEN
```

A palavra correta é **`Bearer`** e o nome correto do cabeçalho é **`Authorization`**.

Exemplo:

```bash
curl http://localhost:3000/produto/ \
  -H "Authorization: Bearer SEU_TOKEN"
```

O login é público. As demais rotas exigem um token JWT válido. As operações de cadastro, alteração e exclusão de funcionários são permitidas somente para usuários com cargo **Gerente**.

---

## 🔌 Rotas da API REST

Todas as rotas abaixo exigem autenticação, exceto `POST /funcionario/login`.

### Funcionário

```
POST   /funcionario/login
GET    /funcionario/
POST   /funcionario/          (Gerente )
GET    /funcionario/{id}
PUT    /funcionario/{id}      (Gerente)
DELETE /funcionario/{id}      (Gerente)
```

### Produto

```
GET    /produto/
POST   /produto/
GET    /produto/{id}
PUT    /produto/{id}
```

### Entrada

```
GET    /entrada/
POST   /entrada/
GET    /entrada/{id}
PUT    /entrada/{id}
DELETE /entrada/{id}           (retorna 405 com mensagem)
```

### Saída

```
GET    /saida/
POST   /saida/
GET    /saida/{id}
PUT    /saida/{id}
DELETE /saida/{id}             (retorna 405 com mensagem)
```

### Movimentação

```
GET    /movimentacao/
POST   /movimentacao/
GET    /movimentacao/{id}
PUT    /movimentacao/{id}
DELETE /movimentacao/{id}      (retorna 405 com mensagem)
```

### Categoria

```
GET    /categoria/
POST   /categoria/
GET    /categoria/{id}
PUT    /categoria/{id}
DELETE /categoria/{id}
```

### Estoque

```
GET    /estoque/
POST   /estoque/
GET    /estoque/{id}
PUT    /estoque/{id}
DELETE /estoque/{id}           (retorna 405 com mensagem)
```

### Cliente

```
GET    /cliente/
POST   /cliente/
GET    /cliente/{id}
PUT    /cliente/{id}
DELETE /cliente/{id}
```

### Fornecedor

```
GET    /fornecedor/
POST   /fornecedor/
GET    /fornecedor/{id}
PUT    /fornecedor/{id}
DELETE /fornecedor/{id}
```

### Ajuste

```
GET    /ajuste/
POST   /ajuste/
GET    /ajuste/{id}
PUT    /ajuste/{id}
```

### Lote

```
GET    /lote/
POST   /lote/
GET    /lote/{id}
PUT    /lote/{id}
```

---

## 🧾 Regras de exclusão

A exclusão física é bloqueada para registros que fazem parte do histórico operacional:

- Entradas;

- Saídas;

- Movimentações;

- Estoque.

Nessas rotas, o `DELETE` retorna:

```
405 Method Not Allowed
```

com uma mensagem explicando que o registro não pode ser apagado. Correções devem ser feitas por atualização permitida ou por um novo ajuste.

Produtos, ajustes e lotes também não possuem rota `DELETE` implementada.

---

## 🖼️ Upload de imagem

O backend possui suporte para receber imagens em Base64 em funcionalidades que utilizam foto. Os arquivos são salvos na pasta `BackEnd/uploads/` e podem ser acessados pela rota estática:

```
/uploads/nome-do-arquivo.extensão
```

O upload de foto diretamente no cadastro de produto ainda não faz parte do fluxo principal de produtos.

---

## 🚀 Como Executar o Projeto

### 1. Instalar as dependências

```bash
cd BackEnd
npm install
```

### 2. Criar o banco de dados

Execute o arquivo `BackEnd/database.sql` no MySQL:

```bash
mysql -u root -p < database.sql
```

### 3. Configurar o ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Depois preencha o `.env` com os dados do MySQL e do JWT:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=autonomoz_db
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=8h
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

### 4. Iniciar o servidor

Para iniciar normalmente:

```bash
npm start
```

Para iniciar com reinicialização automática durante o desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em:

```
http://localhost:3000
```

---

## 🔌 Integrantes do Grupo

- Giovana Lays Coelho Fonseca

- Letícia Roberta Oliveira Souto

- Rafael Teixeira

- Victória Marques