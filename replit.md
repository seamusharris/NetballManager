# Netball Team Management Application

## Overview

This is a comprehensive netball team management application built with modern web technologies. The system provides multi-club support, roster management, statistics tracking, and performance analysis for netball teams. The application features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM for data management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom netball-themed color palette
- **State Management**: React Query (TanStack Query) for server state, React Context for global state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based auth with club-level permissions
- **API Design**: RESTful endpoints with flat camelCase response format
- **File Structure**: Modular route handlers with dedicated middleware

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection Pooling**: Neon serverless pool with WebSocket support
- **Data Integrity**: Foreign key constraints and unique indexes
- **Performance**: Strategic indexes on frequently queried columns

## Key Components

### Multi-Club System
- Club-based user permissions and access control
- Team management across multiple seasons
- Player borrowing system between teams within clubs
- Club-specific branding and configuration

### Game Management
- Comprehensive game status system (upcoming, in-progress, completed, bye, forfeit)
- Team-based scoring with quarter-by-quarter tracking
- Game permissions for cross-club statistics access
- Flexible opponent system supporting BYE games

### Statistics System
- Position-based statistics recording instead of player-based
- Live statistics entry during games
- Quarter-by-quarter performance tracking
- Comprehensive stats including goals, rebounds, intercepts, errors
- Player performance analysis and awards tracking

### User Management
- Role-based permissions (admin, manager, coach, viewer)
- Club-specific user access controls
- Session management with PostgreSQL store

## Data Flow

### Authentication Flow
1. User authentication creates session with club permissions
2. Club context determines accessible resources
3. Middleware validates club access on protected routes
4. API responses filtered based on user permissions

### Statistics Recording Flow
1. Live stats page loads game roster and positions
2. Statistics recorded against positions rather than specific players
3. Stats validation ensures data integrity per quarter
4. Real-time updates to game scores and player performance

### Game Management Flow
1. Games created with team assignments and status
2. Roster management assigns players to positions
3. Statistics collection during game execution
4. Post-game analysis and award assignment

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution for server
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server with external packages
- Assets: Served from `dist/public` directory

### Environment Configuration
- **Development**: `npm run dev` with hot reload
- **Production**: `npm run build && npm run start`
- **Database**: Automatic provisioning via DATABASE_URL

### Hosting Platform
- **Primary**: Replit with autoscale deployment
- **Database**: Neon PostgreSQL serverless
- **Build Process**: Automated via Replit workflows

## Changelog
- June 24, 2025: Implemented unified game score service across all components
  - Created UnifiedGameScoreService as single source of truth for score calculations
  - Refactored GameResultCard to use unified service (eliminated 100+ lines of duplicate logic)
  - Updated winRateCalculator to use unified service for consistency
  - All score calculations now handle team perspective, official vs status scores uniformly
- June 24, 2025: Created unified game score service to consolidate all score calculation logic
- June 23, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.