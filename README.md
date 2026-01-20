# SCIM 2.0 Gateway for Brivo Access Control

![Test Coverage](./coverage/badge-branches.svg)
![Test Coverage](./coverage/badge-functions.svg)
![Test Coverage](./coverage/badge-lines.svg)
![Test Coverage](./coverage/badge-statements.svg)

## Overview

A NestJS-based SCIM 2.0 gateway that enables automated user and group provisioning from identity providers (Okta, Active Directory, etc.) to Brivo's access control system. The service eliminates manual onboarding processes by synchronizing IAM data in real-time while maintaining SCIM 2.0 compliance and data consistency.

**Key Features:**
- Full SCIM 2.0 RFC 7644 compliance for Users and Groups
- Bidirectional data transformation between SCIM and Brivo API formats
- OAuth2 authentication with automatic token management
- Mock mode for local development without Brivo API access
- Clean architecture with separated concerns

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- Docker & Docker Compose
- (Optional) AWS account for production deployment
- (Optional) Brivo API credentials for production mode

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd brivo-scim-gateway
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

**Required variables:**

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=brivo_scim

# SCIM Authentication (for incoming requests from IdP)
SCIM_BASIC_USERNAME=scim_user
SCIM_BASIC_PASSWORD=super_secret_password

# Brivo Integration Mode
BRIVO_MODE=mock  # Use 'mock' for local development
```

**For production mode (`BRIVO_MODE=http`):**

```env
BRIVO_MODE=http
BRIVO_API_URL=https://api.brivo.com
BRIVO_AUTH_URL=https://auth.brivo.com
BRIVO_API_KEY=your_brivo_api_key
BRIVO_CLIENT_ID=your_brivo_client_id
BRIVO_CLIENT_SECRET=your_brivo_client_secret
BRIVO_USERNAME=your_brivo_username
BRIVO_PASSWORD=your_brivo_password
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
npm run migration:run
```

### 5. Start Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`

### 6. Access API Documentation

Swagger UI: `http://localhost:3000/api-docs`

**Authentication:** Basic Auth with credentials from `SCIM_BASIC_USERNAME` and `SCIM_BASIC_PASSWORD`

## API Endpoints

All endpoints require HTTP Basic Authentication.

### Users

- `POST /scim/v2/Users` - Create user
- `GET /scim/v2/Users/:id` - Get user by ID
- `GET /scim/v2/Users` - List users (with filtering, pagination)
- `PUT /scim/v2/Users/:id` - Update user (full replacement)
- `PATCH /scim/v2/Users/:id` - Partial update user
- `DELETE /scim/v2/Users/:id` - Deactivate user

### Groups

- `POST /scim/v2/Groups` - Create group
- `GET /scim/v2/Groups/:id` - Get group by ID
- `GET /scim/v2/Groups` - List groups (with filtering, pagination)
- `PUT /scim/v2/Groups/:id` - Update group
- `PATCH /scim/v2/Groups/:id` - Partial update group
- `DELETE /scim/v2/Groups/:id` - Delete group

### Health Check

- `GET /health` - Application health status

**Documentation:** Full API specification available in Swagger UI

## Deployment

### Infrastructure Setup (Terraform)

All infrastructure is managed via Terraform in the `/deploy` directory:

```bash
cd deploy/terraform
terraform init
terraform plan
terraform apply
```

**Provisioned resources:**
- ECS Cluster with Fargate tasks
- RDS PostgreSQL instance
- ECR repository for Docker images
- IAM roles for ECS tasks and GitHub Actions
- VPC, subnets, security groups
- Secrets Manager for credentials

### CI/CD Pipeline

GitHub Actions workflow automatically deploys on push to `main`:

1. **Lint** - ESLint checks
2. **Test** - Jest tests with coverage reporting
3. **Build & Deploy** - Docker image build and ECS deployment

**OIDC Authentication:** No AWS credentials stored in GitHub - uses IAM role assumption


## Project Structure

```
src/
├── brivo/                    # Brivo API integration module
│   ├── application/          # Business logic & ports
│   ├── contracts/            # DTOs and schemas
│   └── infrastructure/       # HTTP clients, repositories, config
├── scim/                     # SCIM 2.0 protocol module
│   ├── application/          # SCIM services & ports
│   ├── contracts/            # SCIM DTOs and schemas
│   ├── infrastructure/       # Adapters, mappers (Anti-Corruption Layer)
│   └── presentation/         # Controllers, guards, filters
├── core/                     # Shared infrastructure
│   ├── config/               # Environment validation, Swagger
│   └── migrations/           # Database migrations
└── health/                   # Health check module
```

**Architecture Pattern:** Feature modules with layered structure
- **Presentation Layer:** Controllers, guards, filters
- **Application Layer:** Services, ports/interfaces
- **Infrastructure Layer:** Repository implementations, external clients, mappers

## Development Commands

```bash
# Run linter
npm run lint

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# Generate coverage badges
npm run test:badges

# Database migrations
npm run migration:generate -- src/core/migrations/MigrationName
npm run migration:create -- src/core/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Build
npm run build

# Start
npm run start:dev    # Development with hot reload
npm run start:prod   # Production mode
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Application environment |
| `PORT` | Yes | `3000` | HTTP server port |
| `DB_HOST` | Yes | - | PostgreSQL host |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_USER` | Yes | - | Database username |
| `DB_PASSWORD` | Yes | - | Database password |
| `DB_NAME` | Yes | - | Database name |
| `SCIM_BASIC_USERNAME` | Yes | - | SCIM endpoint username |
| `SCIM_BASIC_PASSWORD` | Yes | - | SCIM endpoint password |
| `BRIVO_MODE` | Yes | `mock` | Integration mode: `mock` or `http` |
| `BRIVO_API_URL` | If `http` | - | Brivo API base URL |
| `BRIVO_AUTH_URL` | If `http` | - | Brivo OAuth URL |
| `BRIVO_API_KEY` | If `http` | - | Brivo API key |
| `BRIVO_CLIENT_ID` | If `http` | - | OAuth2 client ID |
| `BRIVO_CLIENT_SECRET` | If `http` | - | OAuth2 client secret |
| `BRIVO_USERNAME` | If `http` | - | Brivo account username |
| `BRIVO_PASSWORD` | If `http` | - | Brivo account password |

**Note:** When `BRIVO_MODE=mock`, all Brivo-specific variables are optional. The application will use in-memory mock data.