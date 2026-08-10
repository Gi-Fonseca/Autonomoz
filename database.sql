CREATE DATABASE IF NOT EXISTS autonomoz_db;
USE autonomoz_db;

-- Tabela FUNCIONÁRIO
CREATE TABLE funcionario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cargo VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL
);

-- Tabela CATEGORIA
CREATE TABLE categoria(
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    tipo_produto VARCHAR(50)
);

-- Tabela PRODUTOS
CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    quantidade INT CHECK(quantidade >= 0) NOT NULL,
    id_categoria INT,
    
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- Tabela ENTRADA PRODUTO
CREATE TABLE entrada_produto (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    id_funcionario INT,
    quantidade INT NOT NULL,
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valor_compra DECIMAL(10, 2) CHECK(valor_compra >= 0) NOT NULL,
    nf VARCHAR(255),
    
    CONSTRAINT fk_entrada_produto FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    CONSTRAINT fk_entrada_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionario(id)
);

-- Tabela SAIDA PRODUTO
CREATE TABLE saida_produto (
    id_saida INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    id_funcionario INT,
    quantidade INT NOT NULL,
    data_saida TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    motivo_saida VARCHAR(255) NOT NULL,
    valor_venda DECIMAL(10, 2) CHECK(valor_venda >= 0),
    nf VARCHAR(255),
    
    CONSTRAINT fk_saida_produto FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    CONSTRAINT fk_saida_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionario(id)
);

-- Tabela ESTOQUE
CREATE TABLE estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10, 2) CHECK(valor_unitario >= 0),
    localizacao VARCHAR(255)
);

-- Tabela MOVIMENTAÇÃO
CREATE TABLE movimentacao (
    id_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
    id_saida INT,
    id_entrada INT,
    id_estoque INT,
    
    CONSTRAINT fk_saida_movimentacao FOREIGN KEY (id_saida) REFERENCES saida_produto(id_saida),
    CONSTRAINT fk_entrada_movimentacao FOREIGN KEY (id_entrada) REFERENCES entrada_produto(id_entrada),
    CONSTRAINT fk_estoque FOREIGN KEY (id_estoque) REFERENCES estoque(id_estoque)
);
