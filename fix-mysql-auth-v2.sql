-- Script atualizado para resolver problema de plugin de autenticação
-- Execute este script no MySQL Workbench

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS johari_assessment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Remover usuário existente se houver
DROP USER IF EXISTS 'johari_user'@'localhost';

-- Criar usuário com plugin de autenticação nativo
CREATE USER 'johari_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'johari123';

-- Dar todas as permissões no banco johari_assessment
GRANT ALL PRIVILEGES ON johari_assessment.* TO 'johari_user'@'localhost';

-- Aplicar as mudanças
FLUSH PRIVILEGES;

-- Verificar se o usuário foi criado corretamente
SELECT User, Host, plugin, authentication_string FROM mysql.user WHERE User = 'johari_user';

-- Mostrar permissões
SHOW GRANTS FOR 'johari_user'@'localhost';

-- Testar conexão
SELECT 'Usuário criado com sucesso!' as status;
