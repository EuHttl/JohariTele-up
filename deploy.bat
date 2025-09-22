@echo off
echo 🚀 Iniciando deploy da aplicação Janela de Johari...

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo [ERROR] Execute este script no diretório raiz do projeto
    pause
    exit /b 1
)

echo [INFO] Preparando projeto para deploy...

REM Build completo
echo [INFO] Fazendo build completo da aplicação...
call build.bat
if %errorlevel% neq 0 (
    echo [ERROR] Falha no build da aplicação
    pause
    exit /b 1
)
echo [SUCCESS] Build da aplicação concluído!

REM Preparar arquivos
echo [INFO] Preparando arquivos...

REM Verificar se há mudanças para commit
git diff --quiet
if %errorlevel% equ 0 (
    git diff --cached --quiet
    if %errorlevel% equ 0 (
        echo [WARNING] Nenhuma mudança para commit
    ) else (
        goto :commit
    )
) else (
    goto :commit
)
goto :check_remote

:commit
echo [INFO] Fazendo commit das mudanças...
git add .
git commit -m "Deploy: Build de produção %date% %time%"
echo [SUCCESS] Commit realizado

:check_remote
REM Verificar se remote origin existe
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Remote origin não configurado
    echo Configure o remote origin com:
    echo git remote add origin https://github.com/EuHttl/johariTeleup
    echo git push -u origin main
) else (
    echo [INFO] Fazendo push para o repositório...
    git push origin main
    if %errorlevel% equ 0 (
        echo [SUCCESS] Push realizado com sucesso!
    ) else (
        echo [ERROR] Falha no push
        pause
        exit /b 1
    )
)

echo.
echo [SUCCESS] 🎉 Deploy preparado com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Acesse https://railway.app e faça deploy (agora com Dockerfile)
echo 2. Configure as variáveis de ambiente no Railway:
echo    - NODE_ENV = production
echo    - JWT_SECRET = johari_window_secret_key_2024_secure
echo    - PORT = 5000
echo 3. A aplicação estará disponível na URL do Railway
echo.
echo 📖 Instruções completas em: deploy-instructions.md
pause
