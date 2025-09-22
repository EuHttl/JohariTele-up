#!/bin/bash

echo "🔨 Building Janela de Johari for production..."

# Instalar dependências do client
echo "📦 Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Build do client
echo "🏗️ Building client..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build client"
    exit 1
fi

# Voltar para o diretório raiz
cd ..

# Instalar dependências do server
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Copiar build do client para o server
echo "📋 Copying client build to server..."
cp -r ../client/build ./public

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment!"
