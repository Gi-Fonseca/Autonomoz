CREATE DATABASE IF NOT EXISTS autonomoz_db;
USE autonomoz_db;

-- =========================================================
-- ESTRUTURA BASE DO AUTONOMOZ
-- Todas as tabelas usam IF NOT EXISTS para preservar dados existentes.
-- =========================================================

CREATE TABLE IF NOT EXISTS funcionario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cargo VARCHAR(100) NOT NULL,
    nome VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    CHECK (CHAR_LENGTH(cpf) >= 11),
    CHECK (CHAR_LENGTH(senha) >= 8)
);

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cadastro VARCHAR(14),
    CHECK (CHAR_LENGTH(cadastro) >= 11 OR cadastro IS NULL)
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    tipo_produto VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    telefone VARCHAR(13) NOT NULL,
    email VARCHAR(100) NOT NULL,
    CHECK (CHAR_LENGTH(cnpj) >= 11)
);

CREATE TABLE IF NOT EXISTS produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT NULL,
    tipo_item ENUM('PECA', 'VEICULO') NOT NULL DEFAULT 'PECA',
    quantidade INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    validade DATE NULL,
    id_categoria INT NOT NULL,
    id_fornecedor INT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    chassi VARCHAR(50) NULL,
    placa VARCHAR(10) NULL,
    ano SMALLINT NULL,
    foto VARCHAR(255) NULL,
    preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
    preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
    CHECK (quantidade >= 0),
    CHECK (estoque_minimo >= 0),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor)
);

CREATE TABLE IF NOT EXISTS entrada_produto (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    quantidade INT NOT NULL,
    data_entrada DATETIME NOT NULL,
    valor_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
    nf VARCHAR(255) NULL,
    fornecedor VARCHAR(255) NOT NULL,
    motivo_entrada VARCHAR(255) NULL,
    CHECK (quantidade > 0),
    CHECK (valor_compra >= 0),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id)
);

CREATE TABLE IF NOT EXISTS saida_produto (
    id_saida INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    id_cliente INT NULL,
    cliente VARCHAR(255) NULL,
    cliente_nome VARCHAR(180) NULL,
    cliente_cnpj VARCHAR(18) NULL,
    quantidade INT NOT NULL,
    data_saida DATETIME NOT NULL,
    motivo_saida VARCHAR(255) NULL,
    valor_venda DECIMAL(10,2) NULL,
    nf VARCHAR(255) NULL,
    cancelada BOOLEAN NOT NULL DEFAULT FALSE,
    cancelada_em DATETIME NULL,
    cancelada_por INT NULL,
    motivo_cancelamento VARCHAR(255) NULL,
    CHECK (quantidade > 0),
    CHECK (valor_venda IS NULL OR valor_venda >= 0),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS ajuste_produto (
    id_ajuste INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    data_ajuste DATETIME NOT NULL,
    motivo_ajuste VARCHAR(255) NOT NULL,
    foto VARCHAR(255) NULL,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id)
);

CREATE TABLE IF NOT EXISTS movimentacao (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_saida INT NULL,
    id_entrada INT NULL,
    id_ajuste INT NULL,
    FOREIGN KEY (id_saida) REFERENCES saida_produto(id_saida),
    FOREIGN KEY (id_entrada) REFERENCES entrada_produto(id_entrada),
    FOREIGN KEY (id_ajuste) REFERENCES ajuste_produto(id_ajuste),
    CHECK ((id_entrada IS NOT NULL) + (id_saida IS NOT NULL) + (id_ajuste IS NOT NULL) = 1)
);

CREATE TABLE IF NOT EXISTS lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    quantidade INT NOT NULL,
    CHECK (quantidade >= 0)
);

CREATE TABLE IF NOT EXISTS estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    id_entrada INT NULL,
    id_saida INT NULL,
    CHECK (valor_unitario >= 0),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_entrada) REFERENCES entrada_produto(id_entrada),
    FOREIGN KEY (id_saida) REFERENCES saida_produto(id_saida)
);

-- =========================================================
-- MIGRAÇÃO SEGURA PARA BANCOS ANTIGOS
-- =========================================================

DROP PROCEDURE IF EXISTS atualizar_schema_autonomoz;
DELIMITER $$
CREATE PROCEDURE atualizar_schema_autonomoz()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'descricao') THEN
        ALTER TABLE produtos ADD COLUMN descricao TEXT NULL AFTER nome;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'tipo_item') THEN
        ALTER TABLE produtos ADD COLUMN tipo_item ENUM('PECA', 'VEICULO') NOT NULL DEFAULT 'PECA' AFTER descricao;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'estoque_minimo') THEN
        ALTER TABLE produtos ADD COLUMN estoque_minimo INT NOT NULL DEFAULT 0 AFTER quantidade;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'chassi') THEN
        ALTER TABLE produtos ADD COLUMN chassi VARCHAR(50) NULL AFTER status;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'placa') THEN
        ALTER TABLE produtos ADD COLUMN placa VARCHAR(10) NULL AFTER chassi;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'ano') THEN
        ALTER TABLE produtos ADD COLUMN ano SMALLINT NULL AFTER placa;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'foto') THEN
        ALTER TABLE produtos ADD COLUMN foto VARCHAR(255) NULL AFTER ano;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'preco_custo') THEN
        ALTER TABLE produtos ADD COLUMN preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER foto;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'preco_venda') THEN
        ALTER TABLE produtos ADD COLUMN preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER preco_custo;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'entrada_produto' AND COLUMN_NAME = 'motivo_entrada') THEN
        ALTER TABLE entrada_produto ADD COLUMN motivo_entrada VARCHAR(255) NULL AFTER fornecedor;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ajuste_produto' AND COLUMN_NAME = 'quantidade') THEN
        ALTER TABLE ajuste_produto ADD COLUMN quantidade INT NOT NULL DEFAULT 0 AFTER id_funcionario;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ajuste_produto' AND COLUMN_NAME = 'foto') THEN
        ALTER TABLE ajuste_produto ADD COLUMN foto VARCHAR(255) NULL AFTER motivo_ajuste;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'id_cliente' AND IS_NULLABLE = 'NO') THEN
        ALTER TABLE saida_produto MODIFY id_cliente INT NULL;
    END IF;
    ALTER TABLE saida_produto MODIFY motivo_saida VARCHAR(255) NULL;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'cliente') THEN
        ALTER TABLE saida_produto ADD COLUMN cliente VARCHAR(255) NULL AFTER id_cliente;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'cliente_nome') THEN
        ALTER TABLE saida_produto ADD COLUMN cliente_nome VARCHAR(180) NULL AFTER cliente;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'cliente_cnpj') THEN
        ALTER TABLE saida_produto ADD COLUMN cliente_cnpj VARCHAR(18) NULL AFTER cliente_nome;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'cancelada') THEN
        ALTER TABLE saida_produto ADD COLUMN cancelada BOOLEAN NOT NULL DEFAULT FALSE AFTER nf;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'cancelada_em') THEN
        ALTER TABLE saida_produto ADD COLUMN cancelada_em DATETIME NULL AFTER cancelada;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'cancelada_por') THEN
        ALTER TABLE saida_produto ADD COLUMN cancelada_por INT NULL AFTER cancelada_em;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto' AND COLUMN_NAME = 'motivo_cancelamento') THEN
        ALTER TABLE saida_produto ADD COLUMN motivo_cancelamento VARCHAR(255) NULL AFTER cancelada_por;
    END IF;
    ALTER TABLE entrada_produto MODIFY data_entrada DATETIME NOT NULL;
    ALTER TABLE saida_produto MODIFY data_saida DATETIME NOT NULL;
    ALTER TABLE ajuste_produto MODIFY data_ajuste DATETIME NOT NULL;
END$$
DELIMITER ;

CALL atualizar_schema_autonomoz();
DROP PROCEDURE IF EXISTS atualizar_schema_autonomoz;

-- Índices usados pelo inventário e pelos alertas.
SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_produtos_tipo_item ON produtos (tipo_item)', 'SELECT 1') FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = 'idx_produtos_tipo_item');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_produtos_estoque_minimo ON produtos (quantidade, estoque_minimo)', 'SELECT 1') FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = 'idx_produtos_estoque_minimo');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Usuário inicial somente se ainda não existir.
INSERT INTO funcionario (cargo, nome, cpf, email, senha)
SELECT 'Gerente', 'Administrador', '11111111111', 'admin@autonomoz.com',
       '$2b$12$sCdwkGzaqblYH9kH2.Jo3.uZ8DsLXZue50ZhEz0/0ETWoUEVbfI06'
WHERE NOT EXISTS (SELECT 1 FROM funcionario WHERE email = 'admin@autonomoz.com');

-- Garantia explícita das datas com horário.
-- Mantém os valores existentes e apenas amplia DATE para DATETIME.
ALTER TABLE entrada_produto
MODIFY data_entrada DATETIME NOT NULL;

ALTER TABLE saida_produto
MODIFY data_saida DATETIME NOT NULL;

ALTER TABLE ajuste_produto
MODIFY data_ajuste DATETIME NOT NULL;
