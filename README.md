# DEVision Job Applicant Subsystem

[![RMIT University](https://img.shields.io/badge/RMIT-University-red)](https://www.rmit.edu.au/)
[![Course](https://img.shields.io/badge/Course-EEET2582%2FISYS3461-blue)](https://www.rmit.edu.au/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/cloud/atlas)
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Testing Guide](#testing-guide)
- [API Documentation](#api-documentation)
- [Infrastructure & DevOps](#infrastructure--devops)
- [Project Structure](#project-structure)
- [Team](#team)
- [Documentation](#documentation)

---

## Overview

The **Job Applicant (JA) subsystem** is a comprehensive recruitment platform designed to empower Computer Science job seekers in their career journey. Built as part of the DEVision ecosystem, this full-stack application provides sophisticated tools for profile management, job search, application tracking, and real-time job matching capabilities.

### Project Context
- **Institution**: RMIT University Vietnam
- **Course**: EEET2582 / ISYS3461 - System Architecture and Design
- **Team**: Son Tinh Squad
- **Milestone**: M2 - Implementation Phase
- **Submission Date**: January 13, 2026
- **Client**: Mr. Tri (Course Instructor)

### Key Objectives
The system addresses the following objectives:
- Enable job seekers to create comprehensive professional profiles
- Facilitate efficient job search and application processes
- Provide premium features for enhanced job matching
- Implement enterprise-grade security and scalability
- Demonstrate mastery of modern software architecture patterns

---

## Features

### Core Features (Simplex Level)

**User Registration & Authentication**
- Email-based registration with verification workflow
- Secure authentication using JWT tokens in HttpOnly cookies
- Password reset functionality via email
- Multi-step account activation process

**Profile Management**
- Editable personal information (email, phone, address, city, country)
- Education history management (degree, institution, duration, GPA)
- Work experience tracking (job title, company, duration, description)
- Professional objective summary

**Job Search & Application**
- Comprehensive job listing browsing from Job Manager subsystem
- Advanced search by keywords, location, and required skills
- Application submission with CV and cover letter uploads
- Real-time application status tracking

### Enhanced Features (Medium Level)

**Advanced Input Validation**
- Real-time validation on both frontend and backend layers
- Password complexity enforcement (minimum 8 characters, uppercase, lowercase, digit, special character)
- Email format validation with domain restrictions (.com or .vn)
- International phone number validation with dial code verification
- Clear, actionable error messaging

**Rich Profile Capabilities**
- Avatar upload with automatic image optimization via Cloudinary
- Technical skills tagging system (e.g., Python, Java, Spring Boot, React)
- Portfolio management supporting images and videos
- Profile completeness tracking and recommendations

**Security Enhancements**
- JWE (JSON Web Encryption) token implementation with RSA-OAEP-256 and A256GCM
- Redis-based token blacklisting to prevent replay attacks
- Brute-force protection limiting login attempts (maximum 5 attempts per 60 seconds)
- Rate limiting on sensitive endpoints

**Premium Subscription System**
- Stripe payment gateway integration
- Flexible subscription plans (Freemium and Premium tiers)
- Feature-based access control
- Automated billing and payment processing

### Advanced Features (Ultimo Level)

**Google OAuth 2.0 SSO**
- Single Sign-On integration with Google Identity Services
- ID token verification workflow
- Automatic profile creation from Google account data
- Optional password setting for SSO users to enable local authentication

**Real-time Job Matching**
- Event-driven architecture using Apache Kafka
- Intelligent matching algorithm based on user-defined search profiles
- WebSocket-based notification delivery for instant updates
- Match scoring system for relevance ranking

**Cloud-Native Infrastructure**
- MongoDB Atlas with country-based sharding strategy
- Redis Cloud with SSL/TLS encryption
- Confluent Cloud Kafka for managed messaging
- Cloudinary for distributed file storage

**Microservices Architecture Components**
- Kong API Gateway for routing and load balancing
- Consul for service discovery and health checking
- Docker containerization for all services
- Docker Compose orchestration for local development

**Headless UI Architecture**
- Custom headless component library
- Complete separation of logic and presentation layers
- Reusable form components with built-in validation
- WCAG-compliant accessibility features

**Administrative Features**
- Comprehensive applicant management dashboard
- Application monitoring and analytics
- User account administration
- System health and performance metrics

---

## Architecture

### Architecture Style
The system implements a **Modular Monolith** architecture with Domain-Driven Design principles, transitioning toward microservices readiness through the use of API Gateway, Service Discovery, and containerization.

### High-Level System Architecture

```
                              Internet
                                 |
                                 v
                    ┌────────────────────────┐
                    │   Kong API Gateway     │
                    │   (Port 80/443)        │
                    └────────────────────────┘
                                 |
                    ┌────────────┴────────────┐
                    |                         |
         ┌──────────v──────────┐   ┌─────────v──────────┐
         │  React Frontend     │   │  Spring Boot       │
         │  (Port 3000)        │   │  Backend           │
         │                     │   │  (Port 8080)       │
         └──────────┬──────────┘   └─────────┬──────────┘
                    │                        │
                    └────────────┬───────────┘
                                 │
                    ┌────────────v────────────┐
                    │  Consul Service         │
                    │  Discovery              │
                    │  (Port 8500)            │
                    └─────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        v                        v                        v
┌───────────────┐      ┌─────────────────┐      ┌────────────────┐
│ MongoDB Atlas │      │  Redis          │      │ Apache Kafka   │
│ (Cloud)       │      │  (Port 6379)    │      │ Confluent Cloud│
└───────────────┘      └─────────────────┘      └────────────────┘
        │                        │                        │
        └────────────────────────┴────────────────────────┘
                                 │
                    ┌────────────v────────────┐
                    │  External Services      │
                    │  - Cloudinary (Files)   │
                    │  - Resend (Email)       │
                    │  - Stripe (Payment)     │
                    │  - Job Manager (API)    │
                    └─────────────────────────┘
```

### Backend Module Structure

The backend follows a modular domain-driven architecture:

```
backend/src/main/java/com/DEVision/JobApplicant/
├── auth/                   # Authentication & Authorization
│   ├── controller/         # REST API endpoints
│   ├── service/           # Business logic layer
│   ├── entity/            # User entity definition
│   └── repository/        # Data access layer
├── applicant/             # Applicant Profile Management
│   ├── controller/        # Profile CRUD operations
│   ├── service/          # Profile business logic
│   ├── entity/           # Applicant, Education, WorkExperience entities
│   └── repository/       # MongoDB repositories
├── application/          # Job Application Management
├── searchProfile/        # Premium Search Profiles & Kafka Job Matching
├── subscription/         # Premium Subscriptions & Stripe Integration
├── notification/         # WebSocket Real-time Notifications
├── jobManager/jobpost/   # Job Manager Subsystem Integration
├── admin/                # Administrative Dashboard
├── jwt/                  # JWE Token Generation & Verification
├── filter/               # Security Filters (Authentication, System-to-System)
└── common/               # Shared Utilities, Configuration, Storage, Email
```

### Frontend Component Architecture

```
JA_frontend/src/
├── components/
│   ├── headless/          # Headless UI Component Library
│   │   ├── form/         # Form components with validation
│   │   ├── modal/        # Modal dialog components
│   │   ├── table/        # Data table components
│   │   └── ...           # Other headless components
│   ├── auth/              # Authentication Components
│   ├── reusable/          # Styled Reusable Components
│   ├── profile/           # Profile Management Components
│   └── layout/            # Application Layout Components
├── pages/                 # Page-Level Components
│   ├── auth/              # Authentication Pages
│   ├── dashboard/         # Dashboard Pages
│   ├── job/               # Job Search Pages
│   ├── subscription/      # Subscription Management
│   └── admin/             # Administrative Pages
├── context/               # React Context Providers
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
├── services/              # API Service Layer
├── hooks/                 # Custom React Hooks
└── utils/                 # Utility Functions and Validators
```

---

## Technology Stack

### Backend Technologies

**Core Framework**
- **Spring Boot 3.4.1** - Application framework
- **Java 21** - Programming language
- **Maven** - Dependency management and build tool

**Database & Caching**
- **MongoDB Atlas** - Primary NoSQL database with country-based sharding
- **Redis 7** - In-memory cache for token management and rate limiting
- **Spring Data MongoDB** - MongoDB integration
- **Lettuce** - Redis client with SSL/TLS support

**Messaging & Events**
- **Apache Kafka** - Distributed event streaming (via Confluent Cloud)
- **Spring Kafka** - Kafka integration framework
- **STOMP Protocol** - WebSocket messaging protocol

**Security**
- **Spring Security 6** - Authentication and authorization framework
- **JWE (JSON Web Encryption)** - Token encryption with RSA-OAEP-256 + A256GCM
- **BCrypt** - Password hashing algorithm
- **OAuth 2.0** - SSO authentication protocol

**File Storage & Media**
- **Cloudinary** - Cloud-based file storage and CDN
- **Multipart File Upload** - File upload handling (up to 100MB)

**Email & Communication**
- **Resend API** - Transactional email service
- **JavaMail API** - Email sending capabilities

**Payment Processing**
- **Stripe API** - Payment gateway integration
- **Stripe Webhooks** - Asynchronous payment confirmations

**API Documentation**
- **Swagger/OpenAPI 3.0** - API documentation and testing
- **SpringDoc OpenAPI** - Swagger UI integration

**Real-time Communication**
- **WebSocket** - Bidirectional communication protocol
- **SockJS** - WebSocket fallback support
- **STOMP** - Simple Text Oriented Messaging Protocol

**Monitoring & Management**
- **Spring Boot Actuator** - Application health and metrics
- **Logback** - Logging framework

### Frontend Technologies

**Core Framework**
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **JavaScript (ES6+)** - Programming language

**State Management**
- **React Context API** - Application state management
- **Custom Hooks** - Reusable state logic

**HTTP & API**
- **Axios** - HTTP client
- **REST API** - Backend communication
- **WebSocket Client** - Real-time updates

**Styling**
- **Tailwind CSS 3** - Utility-first CSS framework
- **Material-UI Components** - Pre-built UI components
- **CSS Modules** - Component-scoped styling

**Form Management**
- **Custom Headless UI** - Form component library
- **Custom Validators** - Input validation logic
- **Real-time Validation** - Immediate user feedback

**Authentication**
- **Google Identity Services** - Google OAuth 2.0 client
- **JWT Handling** - Token storage and management
- **HttpOnly Cookies** - Secure token storage

**Build Tools**
- **React Scripts** - Build configuration
- **Webpack** - Module bundler
- **Babel** - JavaScript transpiler

**Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Infrastructure & DevOps

**Containerization**
- **Docker 24+** - Container runtime
- **Docker Compose** - Multi-container orchestration
- **Dockerfile** - Container image definitions
- **Multi-stage Builds** - Optimized image creation

**API Gateway**
- **Kong 3.4** - API Gateway and management platform
- **Kong Declarative Config** - Configuration as code
- **Rate Limiting** - Request throttling
- **Request/Response Transformation** - Data manipulation

**Service Discovery**
- **Consul 1.17** - Service registry and health checking
- **Consul DNS** - DNS-based service discovery
- **Health Checks** - Service availability monitoring
- **Key-Value Store** - Configuration management

**Cloud Services**
- **MongoDB Atlas** - Managed MongoDB database
- **Redis Cloud** - Managed Redis service with SSL
- **Confluent Cloud** - Managed Kafka service
- **Cloudinary** - Media storage and CDN
- **Railway** - Application hosting platform

**Version Control & Collaboration**
- **Git** - Source control management
- **GitHub** - Code repository and collaboration

**Deployment**
- **Docker Swarm** - Container orchestration (optional)
- **Kubernetes** - Container orchestration (planned)
- **Multi-Droplet Architecture** - Separate gateway and application servers

### Development Tools

**Integrated Development Environments**
- **IntelliJ IDEA** - Java development
- **Visual Studio Code** - Frontend development

**API Testing**
- **Swagger UI** - Interactive API documentation
- **cURL** - Command-line API testing

**Database Management**
- **MongoDB Compass** - MongoDB GUI
- **Robo 3T** - MongoDB management tool

**Cache Management**
- **RedisInsight** - Redis GUI and monitoring
- **Redis CLI** - Command-line Redis interface

**Message Broker Management**
- **Confluent Cloud Console** - Kafka cluster management
- **Kafka Tool** - Kafka topic and message inspection

**Monitoring & Logging**
- **Spring Boot Actuator** - Application metrics
- **Logback** - Application logging
- **Console Logs** - Development debugging

---

## Quick Start

### Prerequisites

Before starting, ensure you have the following installed:
- **Java Development Kit (JDK) 21** or higher
- **Node.js 18** or higher with npm
- **Maven 3.8+** (included as Maven Wrapper)
- **Docker 24+** and Docker Compose
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/ISYS3461-2025C-SonTinh-DEVision/JobApplicant.git
cd JobApplicant
```

### Step 2: Environment Configuration

The backend requires environment variables configured in `.env` file. This file is already present in the `backend/` directory with all necessary cloud service credentials configured.

### Step 3: Start Services with Docker Compose

**Option A: Full Stack with Docker Compose (Recommended for Production-like Environment)**

```bash
# Start all services including Kong, Consul, Redis, Backend, and Frontend
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Option B: Local Development (Recommended for Active Development)**

**Terminal 1 - Start Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 - Start Frontend:**
```bash
cd JA_frontend
npm install
npm start
```

**Terminal 3 - Start Infrastructure (Redis, Kong, Consul):**
```bash
docker-compose up redis kong consul
```

### Step 4: Access the Application

Once all services are running:
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Gateway (Kong)**: http://localhost:8000
- **Swagger Documentation**: http://localhost:8080/swagger-ui.html
- **Consul UI**: http://localhost:8500
- **Kong Admin API**: http://localhost:8001

---

## Detailed Setup

### Backend Setup

**1. Navigate to Backend Directory**
```bash
cd backend
```

**2. Verify Environment Variables**

Ensure `.env` file contains all required variables:
- MongoDB Atlas connection string
- Redis Cloud credentials
- Confluent Cloud Kafka configuration
- Cloudinary API credentials
- Google OAuth credentials
- Stripe API keys
- Resend email API key
- Job Manager integration URL

**3. Build the Project**
```bash
./mvnw clean package
```

**4. Run Tests**
```bash
./mvnw test
```

**5. Run the Application**
```bash
./mvnw spring-boot:run
```

The backend will start on port 8080 with the following features enabled:
- REST API endpoints
- WebSocket server for real-time notifications
- Kafka consumer for job matching events
- Redis connection for caching and token management
- MongoDB connection to Atlas cluster
- Cloudinary integration for file uploads

### Frontend Setup

**1. Navigate to Frontend Directory**
```bash
cd JA_frontend
```

**2. Install Dependencies**
```bash
npm install
```

**3. Environment Configuration**

Create `.env` file (if not present) with:
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_GATEWAY_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

**4. Start Development Server**
```bash
npm start
```

The frontend will start on port 3000 with hot module replacement enabled for rapid development.

### Docker Deployment

**1. Build Docker Images**
```bash
# Build backend image
docker build -t jobapplicant-backend ./backend

# Build frontend image
docker build -t jobapplicant-frontend ./JA_frontend
```

**2. Deploy with Docker Compose**
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View service logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down
```

**3. Deploy Gateway Separately (Production)**

For production deployment following requirement D.3.3 (separate gateway hosting):

```bash
cd deploy/gateway
docker-compose up -d
```

This deploys Kong and Consul on a separate server instance.

---

## Testing Guide

### Pre-configured Test Accounts

The system includes pre-populated test accounts for immediate testing:

| Email | Password | Role | Subscription | Country |
|-------|----------|------|--------------|---------|
| admin@devision.sbs | Admin123! | ADMIN | PREMIUM | Vietnam |
| nguyen.an@gmail.com | Applicant@123 | APPLICANT | PREMIUM | Vietnam |
| tran.bich@gmail.com | Applicant@123 | APPLICANT | FREEMIUM | Singapore |
| lee.weiming@gmail.com | Applicant@123 | APPLICANT | PREMIUM | Singapore |
| tan.meilin@outlook.com | Applicant@123 | APPLICANT | FREEMIUM | United States |
| james.smith@gmail.com | Applicant@123 | APPLICANT | FREEMIUM | AUSTRALIA |

### Core Features to Test

**User Registration & Authentication**
1. Register new account at `/register`
2. Verify email activation workflow
3. Test login with email/password
4. Test Google SSO login
5. Test password reset functionality
6. Verify logout and token blacklisting

**Profile Management**
1. View and edit basic profile information
2. Add, edit, and delete education entries
3. Add, edit, and delete work experience entries
4. Add and remove technical skills
5. Upload avatar image
6. Upload portfolio items (images/videos)

**Job Search & Application**
1. Browse job listings from Job Manager
2. Search jobs by keywords
3. Apply filters (location, skills, type)
4. View job details
5. Submit application with CV and cover letter
6. Track application status
7. Withdraw pending applications

**Premium Features**
1. Upgrade to Premium subscription (use Stripe test card: 4242 4242 4242 4242)
2. Create job search profile with preferences
3. Verify real-time job matching via WebSocket
4. View matched jobs with relevance scores

**Security Features**
1. Test rate limiting (5 failed login attempts)
2. Verify token blacklisting after logout
3. Check JWE token encryption structure
4. Test brute-force protection

**Administrative Features**
1. Login as admin
2. View all applicants with search and filters
3. View applicant details
4. Monitor all applications
5. Check system statistics

---

## API Documentation

### Swagger UI

Interactive API documentation with live testing capabilities is available when the backend is running:

**URL**: http://localhost:8080/swagger-ui.html

Features:
- Complete endpoint documentation
- Request/response schemas
- Try It Out functionality for live API testing
- Authentication configuration
- Example requests and responses

### API Endpoints Reference

**Authentication Endpoints**
- `POST /api/auth/register` - Register new user account
- `GET /api/auth/activate` - Activate account with email token
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/oauth2/login` - Google SSO login
- `POST /api/auth/logout` - Logout and blacklist tokens
- `GET /api/auth/check-session` - Validate current session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/change-email` - Change email address (authenticated)

**Profile Management Endpoints**
- `GET /api/applicants/me` - Get current user profile
- `PUT /api/applicants/me` - Update profile information
- `POST /api/applicants/me/education` - Add education entry
- `PUT /api/applicants/me/education/{id}` - Update education entry
- `DELETE /api/applicants/me/education/{id}` - Delete education entry
- `POST /api/applicants/me/work-experience` - Add work experience
- `PUT /api/applicants/me/work-experience/{id}` - Update work experience
- `DELETE /api/applicants/me/work-experience/{id}` - Delete work experience
- `POST /api/applicants/me/skills` - Add technical skills
- `DELETE /api/applicants/me/skills/{skill}` - Remove skill
- `POST /api/applicants/me/portfolio` - Add portfolio item
- `DELETE /api/applicants/me/portfolio/{id}` - Delete portfolio item

**File Upload Endpoints**
- `POST /api/storage/upload` - Upload file to Cloudinary
- `DELETE /api/storage/{publicId}` - Delete file from Cloudinary

**Job Search & Application Endpoints**
- `GET /api/job-posts` - Get job listings from Job Manager
- `GET /api/job-posts/{id}` - Get job post details
- `POST /api/applications` - Submit job application
- `GET /api/applications/me` - Get my applications
- `GET /api/applications/me/{id}` - Get application details
- `PUT /api/applications/me/{id}/withdraw` - Withdraw application

**Subscription Endpoints**
- `GET /api/subscriptions/me` - Get subscription status
- `POST /api/subscriptions/subscribe` - Subscribe to Premium
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/payment-history` - Get payment history

**Search Profile Endpoints (Premium)**
- `GET /api/search-profiles/me` - Get search profile
- `POST /api/search-profiles/me` - Create/update search profile
- `DELETE /api/search-profiles/me` - Delete search profile
- `GET /api/search-profiles/me/matches` - Get matched jobs

**Notification Endpoints**
- `GET /api/notifications/me` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

**Administrative Endpoints**
- `GET /api/admin/applicants` - List all applicants
- `GET /api/admin/applicants/{id}` - Get applicant details
- `GET /api/admin/applications` - List all applications
- `DELETE /api/admin/applicants/{id}` - Deactivate applicant

---

## Infrastructure & DevOps

### Docker Architecture

The project uses Docker for containerization with a multi-service architecture:

**Services Defined in docker-compose.yml:**

1. **Kong API Gateway** (Port 8000, 8001)
   - API routing and load balancing
   - Rate limiting and request throttling
   - Request/response transformation
   - Declarative configuration via kong.yml

2. **Consul Service Discovery** (Port 8500, 8600)
   - Service registration and discovery
   - Health checking
   - Key-value configuration storage
   - DNS interface for service resolution

3. **Backend Application** (Port 8080)
   - Spring Boot application
   - Connects to MongoDB Atlas
   - Redis integration for caching
   - Kafka consumer for job matching
   - WebSocket server for real-time notifications

4. **Frontend Application** (Port 3000)
   - React application
   - Proxy configuration for API calls
   - Routes through Kong API Gateway in production

5. **Redis Cache** (Port 6379)
   - Token blacklist storage
   - Rate limiting counters
   - Session data caching
   - Persistent data with AOF

**Docker Commands:**

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Remove volumes (clean restart)
docker-compose down -v

# View service status
docker-compose ps
```

### Service Discovery with Consul

Consul provides dynamic service registration and discovery:

**Features:**
- Automatic service registration on startup
- Health check monitoring (HTTP, TCP, Script)
- DNS-based service discovery
- Key-value store for configuration
- Multi-datacenter support

**Accessing Consul:**
- Web UI: http://localhost:8500
- DNS Interface: port 8600
- HTTP API: http://localhost:8500/v1/

### API Gateway with Kong

Kong provides centralized API management:

**Features:**
- Request routing to backend services
- Rate limiting (per consumer, per route)
- Authentication and authorization
- Request/response transformation
- Load balancing
- Circuit breaking
- Logging and monitoring

**Accessing Kong:**
- Proxy: http://localhost:8000
- Admin API: http://localhost:8001

### Deployment Architecture

**Development Environment:**
- All services run locally via Docker Compose
- Hot reload enabled for frontend
- Spring DevTools for backend hot reload
- Redis and Consul run in Docker
- MongoDB Atlas and Kafka Confluent Cloud (external)

**Production Environment:**
- **Gateway Droplet** (Separate Server):
  - Kong API Gateway
  - Consul Server
  - Public IP: 152.42.229.163

- **Application Droplet** (Separate Server):
  - Backend Spring Boot application
  - Frontend React application (static build)
  - Redis (containerized)

- **External Cloud Services**:
  - MongoDB Atlas (database)
  - Confluent Cloud (Kafka)
  - Cloudinary (file storage)
  - Resend (email)
  - Stripe (payment)

This architecture follows **Requirement D.3.3**: API Gateway and Service Discovery hosted separately from frontend/backend.

### Health Checks and Monitoring

**Backend Health Check:**
```bash
curl http://localhost:8080/actuator/health
```

**Kong Health Check:**
```bash
curl http://localhost:8001/status
```

**Consul Health Check:**
```bash
curl http://localhost:8500/v1/health/state/passing
```

**Redis Health Check:**
```bash
docker exec JA_redis redis-cli ping
```

---

## Project Structure

```
JobApplicant/
├── backend/                              # Spring Boot Backend Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/DEVision/JobApplicant/
│   │   │   │   ├── auth/                 # Authentication Module
│   │   │   │   ├── applicant/            # Profile Management Module
│   │   │   │   ├── application/          # Job Application Module
│   │   │   │   ├── searchProfile/        # Search Profile & Matching Module
│   │   │   │   ├── subscription/         # Subscription & Payment Module
│   │   │   │   ├── notification/         # Notification Module
│   │   │   │   ├── jobManager/           # Job Manager Integration
│   │   │   │   ├── admin/                # Administrative Module
│   │   │   │   ├── jwt/                  # JWE Token Module
│   │   │   │   ├── filter/               # Security Filters
│   │   │   │   └── common/               # Common Utilities
│   │   │   └── resources/
│   │   │       ├── application.yml       # Main configuration
│   │   │       ├── application-test.yml  # Test configuration
│   │   │       └── keystore.p12          # SSL certificate
│   │   └── test/                         # Unit and Integration Tests
│   ├── pom.xml                           # Maven dependencies
│   ├── Dockerfile                        # Backend Docker image
│   ├── .env                              # Environment variables
│   └── CLAUDE.md                         # Backend developer guide
│
├── JA_frontend/                          # React Frontend Application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── components/                   # React components
│   │   ├── pages/                        # Page components
│   │   ├── context/                      # React Context providers
│   │   ├── services/                     # API service layer
│   │   ├── hooks/                        # Custom React hooks
│   │   └── utils/                        # Utility functions
│   ├── Dockerfile                        # Frontend Docker image
│   ├── package.json                      # NPM dependencies
│   └── setupProxy.js                     # Development proxy config
│
├── deploy/                               # Deployment configurations
│   ├── application/                      # Application server deployment
│   │   └── docker-compose.yml
│   └── gateway/                          # Gateway server deployment
│       ├── docker-compose.yml
│       └── kong.yml
│
├── gateway/                              # Kong configuration
│   └── kong.yml                          # Kong declarative config
│
├── consul/                               # Consul configuration
│   └── config.json                       # Consul server config
│
├── Docs/                                 # Project documentation
│   ├── EEET2582_DevVision-JobApplicant-v1.1.pdf
│   ├── Milestone 1/                      # M1 submission documents
│   └── Diagram/
│       ├── C4/                           # C4 architecture diagrams
│       └── Squad ERD/                    # Entity relationship diagrams
│
├── docker-compose.yml                    # Local development orchestration
├── CLAUDE.md                             # Project-wide developer guide
├── README.md                             # This file
└── .gitignore                            # Git ignore rules
```

---

## Team

### Son Tinh Squad

| Name | Student ID | Role | Contribution |
|------|------------|------|--------------|
| Tran Minh Truong | s3891643 | Full Stack Developer | 20% |
| Dinh Xuan Minh | s3891847 | Full Stack Developer | 20% |
| Huynh Ngoc Duy | s3924704 | Full Stack Developer | 20% |
| Huynh Nhat Anh | s3924763 | Full Stack Developer | 20% |
| Nguyen Viet Quan | s3926217 | Full Stack Developer | 20% |

**Team Philosophy**: "An Cư Lạc Nghiệp" (Settled and Flourished)

Building careers, empowering futures through innovative technology solutions.

---

## Documentation

### Project Documentation
- **Software Requirements Specification**: [Docs/EEET2582_DevVision-JobApplicant-v1.1.pdf](Docs/EEET2582_DevVision-JobApplicant-v1.1.pdf)
- **Architecture Documentation**: [Docs/Milestone 1/](Docs/Milestone%201/)
- **C4 Architecture Diagrams**: [Docs/Diagram/C4/](Docs/Diagram/C4/)
- **Entity Relationship Diagram**: [Docs/Diagram/Squad ERD/](Docs/Diagram/Squad%20ERD/)

### Developer Guides
- **Project-Wide Guide**: [CLAUDE.md](CLAUDE.md)
- **Backend Developer Guide**: [backend/CLAUDE.md](backend/CLAUDE.md)

### API Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui.html (available when backend is running)

---

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB Atlas**

Solution:
1. Verify MONGODB_URI in .env file is correct
2. Check MongoDB Atlas network access settings
3. Whitelist your IP address or allow access from anywhere (0.0.0.0/0)
4. Verify database user credentials are correct

**Error: Redis connection failed**

Solution:
1. If using Redis Cloud, verify REDIS_SSL_ENABLED=true in .env
2. Check Redis credentials (host, port, password)
3. If Redis is unavailable, the backend will gracefully degrade (rate limiting and token blacklisting disabled)
4. For local development, ensure Redis container is running: `docker ps | grep redis`

**Error: Kafka connection failed**

Solution:
1. Verify Confluent Cloud credentials in .env
2. Check KAFKA_BOOTSTRAP_SERVERS points to correct cluster
3. Verify KAFKA_SASL_JAAS_CONFIG contains valid credentials
4. Note: Real-time job matching requires Kafka; other features work without it

### Frontend Issues

**Error: Cannot connect to backend API**

Solution:
1. Verify backend is running: `curl http://localhost:8080/actuator/health`
2. Check setupProxy.js configuration in frontend
3. Verify REACT_APP_API_BASE_URL in .env
4. Clear browser cache and restart development server

**Error: CORS policy blocking requests**

Solution:
1. Verify CorsConfig in backend allows frontend origin
2. Check that requests go through proxy in development
3. Verify Kong configuration if using API Gateway

### Docker Issues

**Error: Port already in use**

Solution:
1. Check for services already running on ports 3000, 8000, 8080, 8500, 6379
2. Stop conflicting services or change ports in docker-compose.yml
3. Use `docker ps` to identify running containers
4. Use `lsof -i :<port>` to find process using port

**Error: Container keeps restarting**

Solution:
1. Check container logs: `docker logs <container-name>`
2. Verify environment variables are correctly set
3. Check service dependencies are available
4. Verify health check configuration

---

## Configuration

### Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React development server |
| Backend | 8080 | Spring Boot REST API |
| Backend (HTTPS) | 8443 | HTTPS endpoint (if SSL enabled) |
| Kong Gateway | 8000 | API Gateway proxy |
| Kong Admin | 8001 | Kong administration API |
| Consul UI | 8500 | Consul web interface |
| Consul DNS | 8600 | DNS service discovery |
| Redis | 6379 | Cache and token store |

### Database Configuration

**MongoDB Atlas:**
- Database Name: JA-DB
- Test Database: JA-DB-TEST
- Sharding Strategy: Country-based
- Collections: account, applicants, applications, search_profiles, subscriptions, notifications

**Redis:**
- Database: 0 (default)
- Persistence: AOF (Append Only File)
- SSL: Enabled for Redis Cloud

**Kafka:**
- Topics: job-post-events
- Consumer Group: job-applicant-search-profile-group-local
- Replication Factor: 3
- Partitions: 6

---

## License

This project is developed as part of RMIT University coursework for **EEET2582/ISYS3461 - System Architecture and Design**.

All materials are used strictly for **educational and assessment purposes** in accordance with RMIT University academic policies.

**Copyright © 2025-2026 Son Tinh Squad - RMIT University Vietnam**

---

## Contact

### Course Instructor
- **Mr. Tri**
- RMIT University Vietnam
- Course: EEET2582 / ISYS3461 - System Architecture and Design

### Development Team
- **GitHub Repository**: https://github.com/ISYS3461-2025C-SonTinh-DEVision/JobApplicant
- **GitHub Issues**: https://github.com/ISYS3461-2025C-SonTinh-DEVision/JobApplicant/issues

### Individual Team Members
All team members can be reached via their RMIT email addresses:
- s3891643@rmit.edu.vn (Tran Minh Truong)
- s3891847@rmit.edu.vn (Dinh Xuan Minh)
- s3924704@rmit.edu.vn (Huynh Ngoc Duy)
- s3924763@rmit.edu.vn (Huynh Nhat Anh)
- s3926217@rmit.edu.vn (Nguyen Viet Quan)

---

## Acknowledgments

The Son Tinh Squad acknowledges and appreciates:

- **RMIT University Vietnam** for providing the academic framework and resources necessary for this project
- **Mr. Tri** for comprehensive course instruction, guidance, and continuous feedback throughout the development process
- **Job Manager Team** for seamless subsystem integration and collaboration in the DEVision ecosystem
- **Open Source Community** for providing robust libraries, frameworks, and tools that form the foundation of this application
- **Cloud Service Providers** (MongoDB Atlas, Confluent Cloud, Redis Cloud, Cloudinary) for reliable cloud services

---

**Prepared by: Son Tinh Squad**

**Submission Date: January 13, 2026**

**RMIT University Vietnam - EEET2582/ISYS3461**
