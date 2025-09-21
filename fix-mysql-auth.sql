-- Script para resolver problema de autenticação MySQL
-- Execute este script no MySQL Workbench ou linha de comando

-- 1. Conectar como root (se conseguir) ou usar o método de recuperação
-- 2. Criar um novo usuário para o projeto

-- Criar usuário específico para o projeto Johari
CREATE USER IF NOT EXISTS 'johari_user'@'localhost' IDENTIFIED BY 'johari123';

-- Dar todas as permissões no banco johari_assessment
GRANT ALL PRIVILEGES ON johari_assessment.* TO 'johari_user'@'localhost';

-- Aplicar as mudanças
FLUSH PRIVILEGES;

-- Verificar se o usuário foi criado
SELECT User, Host FROM mysql.user WHERE User = 'johari_user';

-- Mostrar permissões
SHOW GRANTS FOR 'johari_user'@'localhost';
