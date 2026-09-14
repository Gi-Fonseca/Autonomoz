CREATE DATABASE IF NOT EXISTS autonomoz_db;
USE autonomoz_db;

-- =========================================================
-- TABELA FUNCIONÁRIO
-- =========================================================
CREATE TABLE funcionario(
	id INT UNIQUE PRIMARY KEY AUTO_INCREMENT,
    cargo VARCHAR(100) NOT NULL,
    nome VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,

    CHECK(CHAR_LENGTH(cpf) >= 11),
    CHECK (CHAR_LENGTH(senha) >= 8)
);

-- =========================================================
-- TABELA CLIENTE (Destino/Cliente)
-- =========================================================
CREATE TABLE cliente(
	id_cliente INT AUTO_INCREMENT UNIQUE PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cadastro VARCHAR(14),

    CHECK(CHAR_LENGTH(cadastro) >= 11)
);

-- =========================================================
-- TABELA CATEGORIA
-- Classificação dos tipos de produtos (criada antes de
-- Produtos pois é referenciada por ela)
-- =========================================================
CREATE TABLE categoria(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    tipo_produto VARCHAR(50) NOT NULL
);

-- =========================================================
-- TABELA FORNECEDOR
-- Criada antes de Produtos pois é referenciada por ela
-- =========================================================
CREATE TABLE fornecedor(
    id_fornecedor INT AUTO_INCREMENT UNIQUE PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    telefone VARCHAR(13) NOT NULL,
    email VARCHAR(100) NOT NULL,

    CHECK(CHAR_LENGTH(cnpj) >= 11)
);

-- =========================================================
-- TABELA PRODUTOS
-- Obs: no documento o campo "Id_fornecedor" aparece como
-- Varchar, mas por ser FK para fornecedor.id_fornecedor,
-- foi implementado como INT para garantir integridade
-- referencial. Ajuste se a intenção era outra.
-- =========================================================
CREATE TABLE produtos(
	id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    quantidade INT NOT NULL,
    validade DATE NULL,
    id_categoria INT NOT NULL,
    id_fornecedor INT NOT NULL,
    status BOOLEAN NOT NULL,

    CHECK(quantidade >= 0),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor)
);

-- =========================================================
-- TABELA ENTRADA_PRODUTO
-- Registra o recebimento de lote de mercadorias no estoque
-- =========================================================
CREATE TABLE entrada_produto(
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    quantidade INT NOT NULL,
    data_entrada DATE NOT NULL,
    valor_compra DECIMAL(10,2) NOT NULL,
    nf VARCHAR(255) NULL,
    fornecedor VARCHAR(255) NOT NULL,

    CHECK(quantidade > 0),
    CHECK(valor_compra >= 0),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id)
);

-- =========================================================
-- TABELA SAIDA_PRODUTO
-- Registra as saídas de mercadorias (vendas, baixas, transferências)
-- =========================================================
CREATE TABLE saida_produto(
    id_saida INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    id_cliente INT NOT NULL,
    quantidade INT NOT NULL,
    data_saida DATE NOT NULL,
    motivo_saida VARCHAR(255) NOT NULL,
    valor_venda DECIMAL(10,2) NULL,
    nf VARCHAR(255) NULL,

    CHECK(quantidade > 0),
    CHECK(valor_venda IS NULL OR valor_venda >= 0),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- =========================================================
-- TABELA AJUSTE_PRODUTO
-- Registra ajustes de mercadorias (quebra, troca, defeito...)
-- =========================================================
CREATE TABLE ajuste_produto(
    id_ajuste INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    data_ajuste DATE NOT NULL,
    motivo_ajuste VARCHAR(255) NOT NULL,

    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id)
);

-- =========================================================
-- TABELA MOVIMENTAÇÃO
-- Centraliza as transações operacionais (histórico de
-- entradas, saídas e ajustes). Apenas um dos campos
-- id_entrada, id_saida ou id_ajuste deve ser preenchido
-- por registro, conforme o tipo de movimentação.
-- =========================================================
CREATE TABLE movimentacao(
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_saida INT NULL,
    id_entrada INT NULL,
    id_ajuste INT NULL,

    FOREIGN KEY (id_saida) REFERENCES saida_produto(id_saida),
    FOREIGN KEY (id_entrada) REFERENCES entrada_produto(id_entrada),
    FOREIGN KEY (id_ajuste) REFERENCES ajuste_produto(id_ajuste),

    -- Garante que apenas um dos três seja preenchido por registro
    CHECK (
        (id_entrada IS NOT NULL) + (id_saida IS NOT NULL) + (id_ajuste IS NOT NULL) = 1
    )
);

-- =========================================================
-- TABELA LOTE
-- Obs: a descrição do campo "quantidade" no documento está
-- inconsistente (texto fala de "FK -- Saida ID"), o que
-- parece um erro de cópia. Implementado da forma mais
-- coerente possível — revise com o time antes de aplicar.
-- =========================================================
CREATE TABLE lote(
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    quantidade INT NOT NULL,

    CHECK(quantidade >= 0)
);

-- =========================================================
-- TABELA ESTOQUE
-- Controla as posições físicas e saldos atuais dos produtos.
-- Obs: o documento não define uma PK explícita para esta
-- tabela; foi adicionado "id_estoque" como chave substituta
-- (surrogate key), já que a rota da API referencia "id_estoque".
-- =========================================================
CREATE TABLE estoque(
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    id_entrada INT NULL,
    id_saida INT NULL,

    CHECK(valor_unitario >= 0),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_entrada) REFERENCES entrada_produto(id_entrada),
    FOREIGN KEY (id_saida) REFERENCES saida_produto(id_saida)
);