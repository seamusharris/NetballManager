#!/bin/bash

# NeballManager Local Development Setup Script
# This script sets up your local development environment with Docker and PostgreSQL

set -e

echo "🚀 Setting up NeballManager local development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop for Mac first."
    echo "   Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please ensure Docker Desktop is running."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please review and update if needed."
else
    echo "✅ .env file already exists"
fi

# Start the database container
echo "🐘 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U neballmanager -d neballmanager; do
    echo "   Database not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:push

echo ""
echo "🎉 Setup complete! Your local development environment is ready."
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Open your browser to: http://localhost:3000"
echo ""
echo "🔧 Useful commands:"
echo "   - Start database: docker-compose -f docker-compose.dev.yml up -d"
echo "   - Stop database: docker-compose -f docker-compose.dev.yml down"
echo "   - View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   - Reset database: docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "💡 The database will persist your data between restarts."
echo "   To completely reset, run: docker-compose -f docker-compose.dev.yml down -v" 