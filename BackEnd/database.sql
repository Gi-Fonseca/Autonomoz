
CREATE DATABASE IF NOT EXISTS autonomoz_db;
USE autonomoz_db;

-- =========================================================
-- TABELA PRODUTOS
-- Obs: no documento o campo "Id_fornecedor" aparece como
-- Varchar, mas por ser FK para fornecedor.id_fornecedor,
-- foi implementado como INT para garantir integridade
-- referencial. Ajuste se a intenção era outra.
-- =========================================================
-- Adiciona somente os campos usados pelo cadastro atualizado de produtos.
-- O procedimento evita erro caso algum campo já exista.
DROP PROCEDURE IF EXISTS adicionar_colunas_produtos_autonomoz;
DELIMITER $$
CREATE PROCEDURE adicionar_colunas_produtos_autonomoz()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'descricao'
    ) THEN
        ALTER TABLE produtos ADD COLUMN descricao TEXT NULL AFTER nome;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'tipo_item'
    ) THEN
        ALTER TABLE produtos ADD COLUMN tipo_item ENUM('PECA', 'VEICULO') NOT NULL DEFAULT 'PECA' AFTER descricao;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'estoque_minimo'
    ) THEN
        ALTER TABLE produtos ADD COLUMN estoque_minimo INT NOT NULL DEFAULT 0 AFTER quantidade;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'chassi'
    ) THEN
        ALTER TABLE produtos ADD COLUMN chassi VARCHAR(50) NULL AFTER status;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'placa'
    ) THEN
        ALTER TABLE produtos ADD COLUMN placa VARCHAR(10) NULL AFTER chassi;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'ano'
    ) THEN
        ALTER TABLE produtos ADD COLUMN ano SMALLINT NULL AFTER placa;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'foto'
    ) THEN
        ALTER TABLE produtos ADD COLUMN foto VARCHAR(255) NULL AFTER ano;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida_produto'
          AND COLUMN_NAME = 'id_cliente' AND IS_NULLABLE = 'NO'
    ) THEN
        ALTER TABLE saida_produto MODIFY id_cliente INT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ajuste_produto' AND COLUMN_NAME = 'quantidade'
    ) THEN
        ALTER TABLE ajuste_produto ADD COLUMN quantidade INT NOT NULL DEFAULT 0 AFTER id_funcionario;
    END IF;
END$$
DELIMITER ;

CALL adicionar_colunas_produtos_autonomoz();
DROP PROCEDURE IF EXISTS adicionar_colunas_produtos_autonomoz;

-- =========================================================
-- ÍNDICES DE PRODUTOS
-- Índices opcionais para acelerar filtros e alertas.
-- =========================================================
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'CREATE INDEX idx_produtos_tipo_item ON produtos (tipo_item)',
        'SELECT 1'
    )
    FROM information_schema.statistics
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'produtos'
      AND INDEX_NAME = 'idx_produtos_tipo_item'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'CREATE INDEX idx_produtos_estoque_minimo ON produtos (quantidade, estoque_minimo)',
        'SELECT 1'
    )
    FROM information_schema.statistics
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'produtos'
      AND INDEX_NAME = 'idx_produtos_estoque_minimo'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =========================================================
-- TABELA FUNCIONÁRIO
-- Cria o administrador apenas se ele ainda não existir.
-- =========================================================
-- Senha de login: Senha@123
INSERT INTO funcionario (cargo, nome, cpf, email, senha)
SELECT 'Gerente', 'Administrador', '11111111111', 'admin@autonomoz.com',
       '$2b$12$sCdwkGzaqblYH9kH2.Jo3.uZ8DsLXZue50ZhEz0/0ETWoUEVbfI06'
WHERE NOT EXISTS (
    SELECT 1 FROM funcionario WHERE email = 'admin@autonomoz.com'
);
