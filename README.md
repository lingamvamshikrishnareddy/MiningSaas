# Mining Operations SaaS Platform

A comprehensive, production-ready mining operations management platform built with **monolithic architecture** for easy deployment and maintenance.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Jobs**: Bull Queue
- **Auth**: JWT

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **State**: Zustand + React Query
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose (optional, for local dev)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mining-ops-saas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mining_ops"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this

# Application
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Start Infrastructure with Docker (Recommended)

```bash
npm run docker:dev
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- pgAdmin on port 5050 (http://localhost:5050)
- Redis Commander on port 8081 (http://localhost:8081)

**Or manually install PostgreSQL and Redis**

### 5. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data (optional)
npm run prisma:seed
```

### 6. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start separately
npm run dev:server  # Backend on http://localhost:5000
npm run dev:client  # Frontend on http://localhost:3000
```

## 🗂️ Project Structure

```
mining-ops-saas/
├── prisma/                  # Database schema & migrations
├── src/
│   ├── server/             # Backend (Express API)
│   │   ├── index.ts        # Server entry point
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── ...
│   ├── client/             # Frontend (Next.js)
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── ...
│   └── shared/             # Shared types & utils
├── tests/                  # Tests
└── config files
```

## 📚 API Documentation

Once the server is running, visit:

**Swagger UI**: http://localhost:5000/api-docs

## 🔑 Core Features

### 1. Fleet Management
- Equipment registration and tracking
- Real-time status monitoring
- Location tracking
- Operating hours tracking

### 2. Maintenance Management
- Preventive maintenance scheduling
- Work order management
- Maintenance history
- Parts inventory tracking

### 3. Telemetry & Monitoring
- Real-time sensor data collection
- Engine metrics (temperature, pressure, etc.)
- GPS tracking
- Alert system

### 4. Fuel Management
- Fuel consumption tracking
- Cost analysis
- Efficiency metrics

### 5. Production Tracking
- Daily production records
- Ore grade tracking
- Blast count tracking

### 6. Safety & Incidents
- Incident reporting
- Investigation workflow
- Safety KPIs
- Regulatory compliance tracking

### 7. Analytics & Reporting
- Fleet utilization
- Maintenance KPIs
- Production trends
- Cost analysis

## 🔐 Authentication

The platform uses JWT-based authentication:

1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Refresh: `POST /api/auth/refresh`

Protected routes require `Authorization: Bearer <token>` header.

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Build both backend and frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📦 Database Management

```bash
# Open Prisma Studio (visual editor)
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# Push schema changes without migration
npm run db:push
```

## 🔄 Database Schema Overview

### Core Entities

- **Organizations** - Multi-tenant support
- **Users** - Role-based access control
- **Sites** - Mining sites/locations
- **Equipment** - Fleet assets
- **Telemetry** - Time-series sensor data
- **Maintenance** - Work orders and history
- **Inspections** - Equipment inspections
- **Fuel Logs** - Fuel consumption
- **Production** - Daily production records
- **Incidents** - Safety incidents
- **KPIs** - Aggregated metrics

## 🌐 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_HOST` | Redis host | `localhost` |
| `JWT_SECRET` | JWT signing secret | - |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🐳 Docker Deployment

```bash
# Build image
docker build -t mining-ops-saas .

# Run container
docker run -p 5000:5000 -p 3000:3000 mining-ops-saas
```

## 📊 Performance Optimization

- **Database**: Indexed queries, connection pooling
- **Caching**: Redis for frequently accessed data
- **Real-time**: Socket.io for telemetry streaming
- **Background Jobs**: Bull queue for heavy operations
- **Frontend**: Next.js SSR, code splitting, image optimization

## 🔒 Security Features

- Helmet.js for HTTP headers
- Rate limiting
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- JWT with refresh tokens
- Password hashing (bcrypt)

## 🎯 Roadmap (Future AI Integration)

This foundation is ready for AI enhancement:

1. **Predictive Maintenance AI**
   - Failure prediction models
   - Optimal maintenance scheduling

2. **Fleet Optimization AI**
   - Route optimization
   - Fuel efficiency AI
   - Idle time reduction

3. **Production AI**
   - Yield prediction
   - Optimal blasting patterns

4. **Safety AI**
   - Computer vision PPE detection
   - Risk prediction models

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@miningops.com

---

Built with ❤️ for Mining Operations Excellence