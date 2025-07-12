# NeballManager Local Development with Docker

This guide will help you set up a local development environment for NeballManager using Docker and PostgreSQL.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [Node.js](https://nodejs.org/) 18 or later
- [Git](https://git-scm.com/) (for cloning the repository)

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically configure everything:

```bash
./scripts/setup-local-dev.sh
```

This script will:
- Check prerequisites
- Start the PostgreSQL database
- Install dependencies
- Set up environment variables
- Run database migrations
- Start the development server

### Option 2: Manual Setup

#### 1. Start the Database

```bash
# Start PostgreSQL in Docker
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for database to be ready (check with):
docker-compose -f docker-compose.dev.yml logs postgres
```

#### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env

# Edit .env to match your local setup
# The default values should work for local development
```

#### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

#### 4. Run Database Migrations

```bash
# Run migrations to set up the database schema
npm run db:migrate
```

#### 5. Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Docker Services

### Database Only (Recommended for Development)

```bash
# Start just the database
docker-compose -f docker-compose.dev.yml up -d

# Stop the database
docker-compose -f docker-compose.dev.yml down

# View database logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Full Application (Optional)

```bash
# Start everything (database + app)
docker-compose up -d

# Stop everything
docker-compose down
```

## Database Management

### Connect to Database

```bash
# Connect using psql (if installed)
psql -h localhost -p 5432 -U neballmanager -d neballmanager

# Or connect using Docker
docker exec -it neballmanager-db-dev psql -U neballmanager -d neballmanager
```

### Reset Database

```bash
# Stop and remove database container
docker-compose -f docker-compose.dev.yml down

# Remove database volume
docker volume rm neballmanager_postgres_data_dev

# Start fresh
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Backup Database

```bash
# Create backup
docker exec neballmanager-db-dev pg_dump -U neballmanager neballmanager > backup.sql

# Restore backup
docker exec -i neballmanager-db-dev psql -U neballmanager neballmanager < backup.sql
```

## Environment Variables

Key environment variables for local development:

```bash
# Database connection
DATABASE_URL=postgresql://neballmanager:neballmanager_dev@localhost:5432/neballmanager

# Application settings
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-session-secret-here
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres
```

### Port Conflicts

If port 5432 is already in use:

```bash
# Check what's using the port
lsof -i :5432

# Or modify docker-compose.dev.yml to use a different port
# Change "5432:5432" to "5433:5432" for example
```

### Node.js Version Issues

```bash
# Check Node version
node -v

# Use nvm to switch versions if needed
nvm use 18
```

## Development Workflow

1. **Start the database**: `docker-compose -f docker-compose.dev.yml up -d`
2. **Start the app**: `npm run dev`
3. **Make changes** to your code
4. **Test locally** at `http://localhost:3000`
5. **Commit and push** changes to GitHub
6. **Pull on Replit** to deploy

## Production vs Development

- **Development**: Uses local PostgreSQL in Docker
- **Production**: Uses Neon Database (PostgreSQL as a service)
- **Environment**: Controlled by `NODE_ENV` variable

## Useful Commands

```bash
# View all running containers
docker ps

# View database logs
docker logs neballmanager-db-dev

# Access database shell
docker exec -it neballmanager-db-dev psql -U neballmanager -d neballmanager

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Clean up Docker system
docker system prune -a
```

## Next Steps

1. Set up your IDE/editor (VS Code, Cursor, etc.)
2. Configure debugging tools
3. Set up testing environment
4. Configure linting and formatting
5. Set up pre-commit hooks

For more information about the application architecture, see the main README.md file. 