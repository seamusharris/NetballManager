# NeballManager - Quick Start Guide

Get your local development environment up and running in minutes!

## 🚀 One-Command Setup

```bash
# Clone the repository (if you haven't already)
git clone <your-repo-url>
cd NeballManager

# Run the automated setup
./scripts/setup-local-dev.sh
```

This will:
- ✅ Check prerequisites (Docker, Node.js)
- 🐘 Start PostgreSQL database in Docker
- 📦 Install all dependencies
- 🗄️ Set up database schema
- 🎉 Start the development server

## 📋 Manual Setup (if needed)

### 1. Install Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) 18 or later

### 2. Start Database
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment
```bash
cp env.example .env
# Edit .env if needed
```

### 5. Set Up Database
```bash
npm run db:push
```

### 6. Start Development Server
```bash
npm run dev
```

## 🌐 Access Your App

- **Frontend**: http://localhost:3000
- **Database**: localhost:5432 (user: neballmanager, pass: neballmanager_dev)

## 🔧 Useful Commands

```bash
# Environment switching
./scripts/switch-env.sh local      # Use local database
./scripts/switch-env.sh remote     # Use remote database
./scripts/switch-env.sh start-db   # Start local database
./scripts/switch-env.sh status     # Show current config

# Database management
npm run db:push                    # Push schema changes
npm run db:generate                # Generate migrations
npm run db:studio                  # Open Drizzle Studio

# Development
npm run dev                        # Start dev server
npm run build                      # Build for production
npm run check                      # Type check
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep postgres

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Reset database completely
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Port Conflicts
If port 5432 is in use:
```bash
# Check what's using the port
lsof -i :5432

# Or modify docker-compose.dev.yml to use port 5433
```

### Node.js Issues
```bash
# Check Node version
node -v

# Use nvm if needed
nvm use 18
```

## 📚 Next Steps

1. **Explore the app** at http://localhost:3000
2. **Read the documentation** in `README-DOCKER.md`
3. **Set up your IDE** (VS Code, Cursor, etc.)
4. **Configure debugging** tools
5. **Set up testing** environment

## 🔄 Development Workflow

1. **Make changes** to your code
2. **Test locally** at http://localhost:3000
3. **Commit and push** to GitHub
4. **Pull on Replit** to deploy

## 📖 More Information

- **Full Documentation**: `README-DOCKER.md`
- **Environment Setup**: `scripts/switch-env.sh`
- **Database Schema**: `shared/schema.ts`
- **API Routes**: `server/routes.ts`

---

**Happy coding! 🎉** 