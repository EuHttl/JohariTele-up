@echo off
echo 🚀 Iniciando deploy da aplicação Janela de Johari...

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo [ERROR] Execute este script no diretório raiz do projeto
    pause
    exit /b 1
)

echo [INFO] Preparando projeto para deploy...

REM Build do frontend
echo [INFO] Fazendo build do frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Falha no build do frontend
    pause
    exit /b 1
)
echo [SUCCESS] Build do frontend concluído!
cd ..

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
echo 1. Acesse https://railway.app e faça deploy do backend
echo 2. Acesse https://vercel.com e faça deploy do frontend
echo 3. Configure as variáveis de ambiente conforme deploy-instructions.md
echo.
echo 📖 Instruções completas em: deploy-instructions.md
pause
