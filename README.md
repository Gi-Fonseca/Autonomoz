AutoNoMoz — Gestão de frota e estoque

O AutoNoMoz é uma aplicação web para acompanhar produtos, peças e veículos, registrar entradas e saídas de estoque e consultar movimentações. O sistema tem usuários nos perfis Gerente e Estoquista, autenticação por JWT e relatórios disponíveis na área de Gerência.

Este README descreve o código presente no repositório. Ele diferencia as telas disponíveis no navegador das rotas existentes somente na API.

Tecnologias

•
Backend: Node.js, Express 5, MySQL, mysql2, JWT, bcryptjs, dotenv e CORS.

•
Frontend: HTML, CSS, JavaScript, Bootstrap 5 e Fetch API.

•
Documentação da API: Swagger UI em /api-docs.

•
Requisito de runtime: Node.js 18 ou superior.

O que está disponível na interface

•
Login: e-mail, senha e seleção do perfil Gerente ou Estoquista. O perfil escolhido precisa corresponder ao cargo associado à conta.

•
Painel: apresenta indicadores de veículos, itens, alertas de estoque e saídas. O índice do painel usa o total de quantidades de saída retornadas dividido pelas unidades atualmente cadastradas; não é uma métrica de valor monetário nem um índice limitado aos últimos 30 dias.

•
Inventário: lista produtos e veículos, permite pesquisar e abrir detalhes, mostra foto e dados cadastrados e apresenta ações para registrar Entrada, Saída ou abrir Ajustes.

•
Cadastro e ajustes de produto: o formulário permite cadastrar um produto ou veículo e, ao abrir um item existente pela ação Ajustes, corrigir o cadastro completo com motivo obrigatório. O ajuste é registrado no histórico. O formulário contempla nome, descrição, tipo, categoria, fornecedor, quantidade, estoque mínimo, foto e, para veículos, chassi, placa e ano.

•
Movimentação rápida: no inventário, Entrada e Saída pedem quantidade e motivo obrigatório. O motivo tem limite de 255 caracteres.

•
Fornecedores: a tela lista, cadastra, edita e exclui fornecedores.

•
Movimentações: tela de consulta do histórico, com data, produto, tipo, quantidade, responsável e motivo. A tela não oferece edição ou exclusão direta de registros do histórico.

•
Gerência: área restrita ao perfil Gerente, com relatórios de Estoque, Movimentações, Entradas e Saídas; mostra resumos e tabelas e permite atualizar, exportar CSV, exportar um documento Word compatível (.doc) e imprimir pelo navegador. A exportação .doc é HTML compatível com Word; não é um arquivo .docx.

•
Tema: há alternância entre aparência clara e escura; a preferência é mantida no navegador.

O cadastro de funcionários é disponibilizado dentro da área de Gerência. A interface permite cadastrar funcionário; as rotas de consulta, alteração e exclusão descritas adiante existem na API, mas não há telas de gerenciamento dessas operações.

Cliente e fornecedor

Fornecedor representa a origem de itens recebidos e possui uma tela de gerenciamento. Cliente representa, na API, um destinatário externo opcional de uma saída — por exemplo, uma pessoa ou empresa que recebe um item. Por isso, Cliente é conceitualmente ligado a saídas, enquanto Fornecedor é ligado a entradas.

A API inclui cadastro, consulta, alteração e exclusão de clientes, e a saída aceita uma associação opcional a um cliente. Não há tela de gerenciamento ou seletor de cliente na interface atual. O relatório de saídas apresenta o identificador (id_cliente), não o nome do cliente. As saídas podem ser registradas sem cliente.

Regras de movimentação

•
Uma entrada aumenta a quantidade do produto em estoque.

•
Uma saída reduz a quantidade e o backend recusa o lançamento quando não há saldo suficiente.

•
Um ajuste aceita quantidade positiva ou negativa; o backend impede que o saldo fique negativo. Na interface, a ação Ajustes abre a correção do cadastro do produto e exige motivo.

•
Os motivos de entrada, saída e ajuste são obrigatórios no respectivo lançamento da API e têm limite de 255 caracteres.

•
A tela de movimentações apresenta o histórico consolidado; ela não é uma tela de edição das entradas e saídas.

API REST

Os endpoints de negócio abaixo exigem Authorization: Bearer <token>, exceto POST /funcionario/login. A documentação interativa da API fica em http://localhost:3000/api-docs quando o servidor está em execução.

Autenticação

POST /funcionario/login recebe email, senha e cargo (Gerente ou Estoquista). O backend confere se o cargo selecionado corresponde ao cargo da conta e retorna token JWT e dados públicos do usuário. O token deve ser enviado nas outras requisições no cabeçalho:

Plain Text


Authorization: Bearer SEU_TOKEN



Rotas

Recurso
Métodos disponíveis
Funcionário
POST /funcionario/login (público); com token: GET /funcionario/, GET /funcionario/:id; somente Gerente: POST /funcionario/, PUT /funcionario/:id, DELETE /funcionario/:id
Produto
GET /produto/, GET /produto/:id, GET /produto/alertas, POST /produto/, PUT /produto/:id
Entrada
GET /entrada/, GET /entrada/:id, POST /entrada/, PUT /entrada/:id; DELETE /entrada/:id responde 405
Saída
GET /saida/, GET /saida/:id, POST /saida/, PUT /saida/:id; DELETE /saida/:id responde 405
Ajuste
GET /ajuste/, GET /ajuste/:id, POST /ajuste/, PUT /ajuste/:id; não há rota DELETE
Movimentação
GET /movimentacao/, GET /movimentacao/:id, POST /movimentacao/, PUT /movimentacao/:id; DELETE /movimentacao/:id responde 405
Fornecedor
GET /fornecedor/, GET /fornecedor/:id, POST /fornecedor/, PUT /fornecedor/:id, DELETE /fornecedor/:id
Cliente
GET /cliente/, GET /cliente/:id, POST /cliente/, PUT /cliente/:id, DELETE /cliente/:id
Categoria
GET /categoria/, GET /categoria/:id, POST /categoria/, PUT /categoria/:id, DELETE /categoria/:id
Estoque
GET /estoque/, GET /estoque/:id, POST /estoque/, PUT /estoque/:id; DELETE /estoque/:id responde 405
Lote
GET /lote/, GET /lote/:id, POST /lote/, PUT /lote/:id
Relatórios
somente Gerente: GET /relatorios/estoque, /relatorios/movimentacoes, /relatorios/entradas, /relatorios/saidas




A presença de uma rota nesta tabela descreve a API; não implica a existência de uma tela para aquela operação. Nas rotas de produto, fornecedor, cliente, categoria, estoque e lote, o roteamento exige autenticação JWT, mas não aplica uma restrição de cargo adicional. A autorização específica de Gerente está aplicada às operações de escrita de funcionário e aos relatórios.

GET /movimentacao/ retorna o histórico consolidado das tabelas de entrada, saída e ajuste, ordenado por data e limitado a 500 registros. GET /movimentacao/:id, POST /movimentacao/ e PUT /movimentacao/:id tratam os vínculos registrados na tabela movimentacao; não substituem os lançamentos próprios de entrada, saída ou ajuste e não atualizam o estoque por si mesmos.

Limitações relevantes da API e da interface

•
O formulário de produto exibe campos de SKU e preço de custo/venda, mas o script atual não os envia para persistência. Não conte com esses campos como dados salvos.

•
A tela de movimentação rápida oferece Entrada e Saída; não solicita cliente, nota fiscal, preço ou tipo comercial de saída. Esses dados não são coletados nesse formulário.

•
A API oferece PUT de entrada e saída, mas essas rotas não reconciliam de forma confiável o saldo de estoque em todas as alterações. A tela de histórico não oferece esses botões de edição; a ação visível para corrigir cadastro de produto é Ajustes.

•
O relatório de estoque detalha produtos ativos e inativos, enquanto o resumo SQL usa filtro de produtos ativos. Por isso, os totais do resumo e da tabela podem não coincidir quando há itens inativos.

•
O cartão do Inventário rotulado “Valor em estoque” exibe a soma de unidades, não um valor em dinheiro.

•
O botão “Resetar Chave” aparece no login, mas não há fluxo de recuperação de senha implementado nos scripts atuais.

•
Não há testes automatizados configurados. O comando npm test termina com a mensagem “no test specified”.

Imagens

O backend recebe imagens em Base64 nos fluxos que as suportam, grava os arquivos em BackEnd/uploads/ e os serve em /uploads/nome-do-arquivo. O cadastro/ajuste de produto oferece seleção e prévia de foto. Os arquivos enviados ficam no disco local do servidor; cuide de cópias de segurança e não inclua imagens privadas no Git.

Instalação e execução

Pré-requisitos

•
Node.js 18 ou superior e npm.

•
MySQL em execução.

•
Um schema-base do AutoNoMoz já criado, com as tabelas usadas pelo projeto.


Importante sobre o banco: BackEnd/database.sql cria/seleciona o banco autonomoz_db e aplica alterações condicionais, índices e um cadastro inicial se as tabelas correspondentes já existirem. Ele não contém o CREATE TABLE completo do sistema. Portanto, sozinho, não instala o projeto em um MySQL vazio. É necessário obter/criar o schema-base compatível antes de executar o script.

Dependências

Na pasta BackEnd, instale as dependências:

Bash


cd BackEnd
npm install



Banco de dados

Com o schema-base compatível já carregado, execute o script a partir da raiz do repositório:

Bash


mysql -u root -p < BackEnd/database.sql



O script inclui um usuário Gerente inicial apenas se ainda não houver conta com o mesmo e-mail. A credencial de demonstração está comentada no próprio SQL; altere-a antes de disponibilizar o sistema em qualquer ambiente compartilhado.

Variáveis de ambiente

O repositório não inclui .env.example. Crie manualmente BackEnd/.env e preencha os valores de acordo com sua instalação. Exemplo para uso local:

Plain Text


PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=autonomoz_db
DB_TIMEZONE=-03:00
JWT_SECRET=troque_por_um_segredo_aleatorio_longo
JWT_EXPIRES_IN=8h
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000



JWT_SECRET deve ser definido para assinar e validar os tokens. PORT, configurações do banco, fuso horário e tempo do token possuem valores padrão no código, mas configure-os explicitamente para seu ambiente. Quando CORS_ORIGINS contém uma lista, separe as origens por vírgulas e use a origem exata, incluindo protocolo e porta. Para acesso na rede local, inclua também a origem usada pelo navegador, por exemplo http://192.168.0.147:3000. No código atual, se CORS_ORIGINS ficar vazio, o servidor permite qualquer origem; para ambientes compartilhados, configure a lista explicitamente.

O arquivo .env é ignorado pelo Git. Não publique senhas do banco nem o JWT_SECRET.

Iniciar

Ainda dentro da pasta BackEnd:

Bash


npm start



Durante desenvolvimento, pode-se usar:

Bash


npm run dev



O servidor Express atende a API e também serve os arquivos estáticos de FrontEnd/ na mesma porta. Com a configuração padrão, abra:

Plain Text


http://localhost:3000/login.html



O backend aceita JSON e formulários URL-encoded até 16 MB para suportar imagens codificadas em Base64. A aplicação não depende de um servidor frontend separado quando é aberta por essa URL.

Estrutura principal

Plain Text


BackEnd/
  database.sql                 Migrações e seed; não é schema completo
  package.json                 Dependências e comandos Node.js
  src/
    app.js                     Middleware, arquivos estáticos, rotas e Swagger
    server.js                  Inicialização do servidor
    config/                    Conexão MySQL
    controllers/               Tratamento HTTP
    middlewares/               Autenticação JWT e autorização
    repositories/               Consultas e persistência MySQL
    routes/                    Rotas da API
    services/                  Validação e regras de negócio
    utils/                     Uploads e tratamento de erros
FrontEnd/
  *.html                       Páginas do sistema
  src/css/                     Estilos
  src/js/ e src/scripts/        Lógica da interface e chamadas à API



Equipe

•
Giovana Lays Coelho Fonseca

•
Letícia Roberta Oliveira Souto

•
Rafael Teixeira

•
Victória Marques

