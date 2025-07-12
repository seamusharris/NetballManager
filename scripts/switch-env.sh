#!/bin/bash

# NeballManager Environment Switcher
# This script helps switch between local and remote database environments

set -e

LOCAL_DB_URL="postgresql://neballmanager:neballmanager_dev@localhost:5432/neballmanager"

# Function to show current environment
show_current_env() {
    if [ -f .env ]; then
        echo "Current DATABASE_URL:"
        grep DATABASE_URL .env || echo "DATABASE_URL not found in .env"
    else
        echo "No .env file found"
    fi
}

# Function to switch to local environment
switch_to_local() {
    echo "🔄 Switching to local database environment..."
    
    if [ ! -f .env ]; then
        cp env.example .env
    fi
    
    # Update DATABASE_URL to local
    if grep -q "DATABASE_URL" .env; then
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$LOCAL_DB_URL|" .env
    else
        echo "DATABASE_URL=$LOCAL_DB_URL" >> .env
    fi
    
    echo "✅ Switched to local database"
    echo "   Make sure your local database is running:"
    echo "   docker-compose -f docker-compose.dev.yml up -d"
}

# Function to switch to remote environment
switch_to_remote() {
    echo "🔄 Switching to remote database environment..."
    
    if [ ! -f .env ]; then
        echo "❌ No .env file found. Please create one first."
        exit 1
    fi
    
    echo "⚠️  Please enter your remote DATABASE_URL:"
    read -p "DATABASE_URL: " remote_url
    
    if [ -z "$remote_url" ]; then
        echo "❌ No URL provided. Aborting."
        exit 1
    fi
    
    # Update DATABASE_URL to remote
    if grep -q "DATABASE_URL" .env; then
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$remote_url|" .env
    else
        echo "DATABASE_URL=$remote_url" >> .env
    fi
    
    echo "✅ Switched to remote database"
}

# Function to start local database
start_local_db() {
    echo "🐘 Starting local PostgreSQL database..."
    docker-compose -f docker-compose.dev.yml up -d postgres
    
    echo "⏳ Waiting for database to be ready..."
    until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U neballmanager -d neballmanager 2>/dev/null; do
        echo "   Database not ready yet, waiting..."
        sleep 2
    done
    
    echo "✅ Local database is ready!"
}

# Function to stop local database
stop_local_db() {
    echo "🛑 Stopping local PostgreSQL database..."
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Local database stopped"
}

# Main script logic
case "${1:-}" in
    "local")
        switch_to_local
        ;;
    "remote")
        switch_to_remote
        ;;
    "start-db")
        start_local_db
        ;;
    "stop-db")
        stop_local_db
        ;;
    "status")
        show_current_env
        ;;
    "help"|"-h"|"--help"|"")
        echo "NeballManager Environment Switcher"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  local      Switch to local database environment"
        echo "  remote     Switch to remote database environment"
        echo "  start-db   Start local PostgreSQL database"
        echo "  stop-db    Stop local PostgreSQL database"
        echo "  status     Show current environment configuration"
        echo "  help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 local        # Switch to local database"
        echo "  $0 remote       # Switch to remote database"
        echo "  $0 start-db     # Start local database"
        echo "  $0 status       # Show current config"
        echo ""
        show_current_env
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac 