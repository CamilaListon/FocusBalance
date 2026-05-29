
-- 1. Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS focusbalance_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE focusbalance_db;

-- 2. Tabela de Usuários
CREATE TABLE usuarios (
id INT AUTO_INCREMENT,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
senha VARCHAR(255) NOT NULL,
tipo_plano ENUM('gratuito', 'premium') DEFAULT 'gratuito',
streak_atual INT DEFAULT 0,
maior_streak INT DEFAULT 0,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;

-- 3. Tabela de Registros Diários
CREATE TABLE registros (
id INT AUTO_INCREMENT,
usuario_id INT NOT NULL,
data_registro DATE NOT NULL,
tempo_total_minutos INT NOT NULL,
nivel_produtividade ENUM('baixa', 'media', 'alta') NOT NULL,
observacoes TEXT NULL,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY uq_usuario_data (usuario_id, data_registro),
CONSTRAINT fk_registros_usuario FOREIGN KEY (usuario_id)
REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabela de Aplicativos
CREATE TABLE aplicativos (
id INT AUTO_INCREMENT,
registro_id INT NOT NULL,
nome_app VARCHAR(60) NOT NULL,
tempo_uso_minutos INT NOT NULL,
PRIMARY KEY (id),
CONSTRAINT fk_aplicativos_registro FOREIGN KEY (registro_id)
REFERENCES registros (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabela de Metas
CREATE TABLE metas (
id INT AUTO_INCREMENT,
usuario_id INT NOT NULL,
nome_app VARCHAR(60) DEFAULT NULL,
limite_diario_minutos INT NOT NULL,
objetivo_descricao VARCHAR(255) NULL,
ativa BOOLEAN DEFAULT TRUE,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
CONSTRAINT fk_metas_usuario FOREIGN KEY (usuario_id)
REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Índices de Performance
CREATE INDEX idx_registros_busca ON registros (usuario_id, data_registro);
CREATE INDEX idx_aplicativos_nome ON aplicativos (nome_app);

-- 7. View do Dashboard
CREATE OR REPLACE VIEW vw_dashboard_analytics AS
SELECT
u.id AS usuario_id,
u.nome AS usuario_nome,
u.tipo_plano,
u.streak_atual,
COUNT(r.id) AS total_dias_registrados,
IFNULL(SUM(r.tempo_total_minutos), 0) AS tempo_vida_total_minutos,
ROUND(IFNULL(AVG(r.tempo_total_minutos), 0), 1) AS media_diaria_minutos,
(
SELECT nome_app
FROM aplicativos a
JOIN registros reg ON a.registro_id = reg.id
WHERE reg.usuario_id = u.id
GROUP BY nome_app
ORDER BY SUM(tempo_uso_minutos) DESC
LIMIT 1
) AS app_mais_utilizado
FROM usuarios u
LEFT JOIN registros r ON u.id = r.usuario_id
GROUP BY u.id, u.nome, u.tipo_plano, u.streak_atual;

ALTER TABLE usuarios MODIFY COLUMN foto_url LONGTEXT;
DESCRIBE usuarios;

SELECT * FROM registros;