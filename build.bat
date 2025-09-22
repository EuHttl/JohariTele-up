@echo off
echo 🔨 Building Janela de Johari for production...

REM Instalar dependências do client
echo 📦 Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

REM Build do client
echo 🏗️ Building client...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build client
    pause
    exit /b 1
)

REM Voltar para o diretório raiz
cd ..

REM Instalar dependências do server
echo 📦 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

REM Copiar build do client para o server
echo 📋 Copying client build to server...
if not exist "public" mkdir public
xcopy /E /I /Y "..\client\build" "public"

echo ✅ Build completed successfully!
echo 🚀 Ready for deployment!
pause
