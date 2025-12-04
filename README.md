# **DEVision – Job Applicant Subsystem**

[![RMIT University](https://img.shields.io/badge/RMIT-University-red)](https://www.rmit.edu.au/)
[![Course](https://img.shields.io/badge/Course-EEET2582%2FISYS3461-blue)](https://www.rmit.edu.au/)
[![License](https://img.shields.io/badge/License-Educational-green)](LICENSE)

---

## **📋 Overview**

The **Job Applicant (JA) subsystem** is part of the **DEVision** recruitment platform, designed to connect Computer Science job seekers with their potential employers. This subsystem provides comprehensive tools for career advancement, enabling applicants to:

- 🔐 Register and authenticate securely (including SSO via Google OAuth)
- 👤 Create and manage professional profiles with skills, education, and work experience
- 🔍 Search and browse job posts from the Job Manager subsystem
- 📝 Submit job applications with CV and cover letter uploads
- 💎 Subscribe to premium features for real-time job matching notifications
- 🔔 Receive instant alerts when new jobs match their preferences

---

## **🏗️ Architecture**

### **System Design**
- **Architecture Style**: Modular Monolith (Medium level)
- **Frontend**: React with Headless UI pattern
- **Backend**: Spring Boot with modular structure
- **Database**: MongoDB Atlas with country-based sharding (Ultimo level)
- **Caching**: Redis for performance optimization
- **Messaging**: Kafka for asynchronous communication with Job Manager
- **Storage**: Firebase/Cloudinary for media files (CV, cover letters, portfolios)
- **Deployment**: Docker containerization

### **Key Modules**
1. **Authentication Module** - Login, registration, SSO, JWT tokens
2. **Profile Management Module** - Personal info, skills, education, experience
3. **Application Module** - Job application submission and tracking
4. **Job Search Module** - Browse and filter jobs from Job Manager
5. **Subscription Module** - Premium plan management and payment
6. **Notification Module** - Real-time job match alerts via Kafka
7. **Admin Module** - System administration and user management
8. **File Storage Module** - Handle CV, cover letter, and portfolio uploads

---

## **📁 Repository Structure**

```
JobApplicant/
├── backend/                    # Spring Boot Backend (to be implemented)
│   ├── src/
│   │   ├── main/java/com/devision/jobapplicant/
│   │   │   ├── authentication/
│   │   │   ├── profile/
│   │   │   ├── application/
│   │   │   ├── subscription/
│   │   │   ├── notification/
│   │   │   ├── admin/
│   │   │   └── filestorage/
│   │   └── resources/
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                   # React Frontend (to be implemented)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── authentication/
│   │   │   ├── profile/
│   │   │   ├── jobSearch/
│   │   │   ├── subscription/
│   │   │   ├── application/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── package.json
│   └── Dockerfile
│
├── Docs/                       # Project Documentation ✅
│   ├── EEET2582_DevVision-JobApplicant-v1.1.pdf
│   ├── Milestone 1/
│   └── Diagram/
│       ├── C4/
│       └── Squad ERD/
│
├── docker-compose.yml          # Local development setup (to be created)
├── .gitignore                  # Git ignore rules ✅
└── README.md                   # This file
```

---

## **🎯 Milestone 2 - Implementation Plan**

**Due Date**: 18:00 on 13 January 2026

### **Phase 1: Project Setup & Infrastructure (Week 1)**

#### 1.1 Backend Setup
- [x] Initialize Spring Boot project with Maven ✅
- [x] Configure application.yml for MongoDB Atlas ✅
- [x] Set up Redis connection for caching and rate limiting ✅
- [x] Create modular package structure (auth, applicant, common, jwt, filter) ✅
- [x] Configure Spring Security with JWT authentication ✅
- [x] Set up email service (Resend SMTP) ✅
- [ ] Configure Kafka consumer for Job Post events

#### 1.2 Frontend Setup
- [ ] Initialize React project with Vite/Create React App
- [ ] Set up React Router for navigation
- [ ] Configure Axios for REST API calls
- [ ] Create folder structure (modules, components, hooks, services)
- [ ] Set up Context-based state management

#### 1.3 Database & Infrastructure
- [x] Set up MongoDB Atlas cluster ✅
- [x] Create database collections (AUTH, APPLICANT) ✅
- [x] Set up Redis instance (localhost:6379) ✅
- [ ] Configure country-based sharding on APPLICANT collection
- [ ] Create remaining collections (EDUCATION, WORK_EXPERIENCE, etc.)
- [ ] Configure Kafka topics for JA-JM communication

#### 1.4 DevOps
- [ ] Create Dockerfiles for backend and frontend
- [ ] Set up docker-compose.yml for local development
- [ ] Configure environment variables

---

### **Phase 2: Core Features Implementation (Weeks 2-4)**

#### 2.1 Authentication Module (Simplex + Medium)
**Backend:**
- [x] POST /register - User registration with email activation ✅
- [x] POST /login - Login with JWT token generation (access + refresh) ✅
- [x] POST /logout - Token revocation with Redis blacklist ✅
- [x] POST /refresh - Refresh access token using refresh token ✅
- [x] GET /activate - Email verification endpoint with token validation ✅
- [x] POST /forgot-password - Request password reset via email ✅
- [x] POST /reset-password - Reset password using email token ✅
- [x] GET /check-session - Validate session and refresh token if needed ✅
- [ ] POST /auth/google - Google OAuth SSO integration (Ultimo)
- [x] Password validation (min 8 chars, complexity rules) ✅
- [x] Email validation with real email delivery ✅
- [x] Store tokens in HttpOnly cookies for security ✅
- [x] Redis-based token blacklisting (prevents reuse after logout) ✅
- [x] Brute-force protection (max 5 attempts per 60 seconds) ✅
- [x] BCrypt password hashing ✅
- [x] JWT with signature verification ✅
- [x] Activation token with 24-hour expiry ✅
- [x] Reset token with 1-hour expiry ✅
- [x] Swagger/OpenAPI documentation ✅
- [x] Postman collection for API testing ✅

**Frontend:**
- [ ] Login page with form validation
- [ ] Registration page with multi-step form
- [ ] Email verification page
- [ ] Google OAuth button and callback handler
- [ ] Forgot password flow
- [ ] Token management and auto-refresh

---

#### 2.2 Profile Management Module (Simplex + Medium)
**Backend:**
- [ ] GET /profile - Retrieve applicant profile
- [ ] PUT /profile - Update personal information
- [ ] POST /profile/education - Add education entry
- [ ] PUT /profile/education/{id} - Update education
- [ ] DELETE /profile/education/{id} - Remove education
- [ ] POST /profile/experience - Add work experience
- [ ] PUT /profile/experience/{id} - Update experience
- [ ] DELETE /profile/experience/{id} - Remove experience
- [ ] POST /profile/skills - Add/update skills
- [ ] POST /profile/avatar - Upload avatar image
- [ ] Implement profile country update with shard migration (Ultimo)

**Frontend:**
- [ ] Profile view page
- [ ] Profile edit form with validation
- [ ] Education section (add/edit/delete)
- [ ] Work experience section (add/edit/delete)
- [ ] Skills management with tag input
- [ ] Avatar upload with preview
- [ ] Profile completeness indicator

---

#### 2.3 Job Search & Application Module (Simplex + Medium)
**Backend:**
- [ ] GET /jobs - Fetch job list from Job Manager API
- [ ] GET /jobs/{id} - Fetch job details from Job Manager API
- [ ] POST /applications - Submit job application
- [ ] GET /applications - Get user's application history
- [ ] GET /applications/{id} - Get application details
- [ ] POST /applications/{id}/withdraw - Withdraw application
- [ ] Implement Redis caching for job listings
- [ ] Full-text search on job data (Medium)
- [ ] Lazy loading/pagination for job results

**Frontend:**
- [ ] Job search page with search bar
- [ ] Advanced filters (location, skills, salary, employment type)
- [ ] Job card list with infinite scroll
- [ ] Job detail page
- [ ] Application modal with CV/cover letter upload
- [ ] Application history page
- [ ] Application status tracking

---

#### 2.4 File Storage Module (Medium)
**Backend:**
- [ ] POST /files/cv - Upload CV to Firebase/Cloudinary
- [ ] POST /files/cover-letter - Upload cover letter
- [ ] POST /files/portfolio - Upload portfolio items
- [ ] GET /files/{id} - Retrieve file metadata
- [ ] DELETE /files/{id} - Delete file
- [ ] Implement file type validation (.pdf, .docx)
- [ ] Implement file size validation (max 5MB)
- [ ] Store file URLs in MongoDB
- [ ] Automatic image resizing for avatars

**Frontend:**
- [ ] File upload component with drag-and-drop
- [ ] File preview functionality
- [ ] Upload progress indicator
- [ ] File size/type validation feedback

---

#### 2.5 Premium Subscription Module (Simplex + Medium + Ultimo)
**Backend:**
- [ ] POST /subscription/subscribe - Initiate subscription
- [ ] GET /subscription/status - Check subscription status
- [ ] POST /subscription/cancel - Cancel subscription
- [ ] GET /subscription/history - Get billing history
- [ ] POST /subscription/search-profile - Save job search preferences
- [ ] GET /subscription/search-profile - Retrieve search preferences
- [ ] Integrate with Payment Gateway (Stripe/PayPal)
- [ ] Implement Kafka consumer for job post events (Ultimo)
- [ ] Real-time matching algorithm (Ultimo)
- [ ] Send email notifications 7 days before expiry

**Frontend:**
- [ ] Subscription pricing page
- [ ] Payment form with Stripe/PayPal integration
- [ ] Subscription status display
- [ ] Search profile configuration form
- [ ] Billing history page
- [ ] Subscription management (upgrade/cancel)

---

#### 2.6 Notification Module (Medium + Ultimo)
**Backend:**
- [ ] Kafka consumer for job-post-created events
- [ ] Kafka consumer for job-post-updated events
- [ ] Matching algorithm (compare job with search profile)
- [ ] POST /notifications - Create notification
- [ ] GET /notifications - Get user notifications
- [ ] PUT /notifications/{id}/read - Mark as read
- [ ] WebSocket endpoint for real-time push
- [ ] Email notification service integration

**Frontend:**
- [ ] Notification bell icon with unread count
- [ ] Notification dropdown list
- [ ] WebSocket client for real-time updates
- [ ] Toast notifications for new job matches
- [ ] Notification preferences page

---

#### 2.7 Admin Module (Simplex + Medium)
**Backend:**
- [ ] GET /admin/applicants - List all applicants
- [ ] GET /admin/applicants/{id} - View applicant details
- [ ] DELETE /admin/applicants/{id} - Deactivate applicant
- [ ] GET /admin/companies - List all companies (from JM)
- [ ] GET /admin/job-posts - List all job posts (from JM)
- [ ] GET /admin/applications - List all applications
- [ ] Search and filter endpoints

**Frontend:**
- [ ] Admin dashboard
- [ ] Applicant management table with search/filter
- [ ] Company management table (read-only from JM)
- [ ] Job post management table (read-only from JM)
- [ ] Application monitoring
- [ ] User detail modals

---

### **Phase 3: Integration & Testing (Week 5)**

#### 3.1 API Integration with Job Manager
- [ ] Implement API calls to JM for job listings
- [ ] Implement API calls to JM for company profiles
- [ ] Provide applicant profile API for JM
- [ ] Provide application data API for JM
- [ ] Test cross-subsystem authentication

#### 3.2 Kafka Event Integration
- [ ] Test job-post-created event consumption
- [ ] Test job-post-updated event consumption
- [ ] Test applicant-profile-updated event publishing
- [ ] Verify real-time notification delivery

#### 3.3 Testing
- [ ] Unit tests for backend services
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests
- [ ] End-to-end testing for critical flows
- [ ] Load testing for MongoDB sharding
- [ ] Security testing (XSS, CSRF, SQL injection prevention)

---

### **Phase 4: Database Population & Deployment (Week 6)**

#### 4.1 Database Script
Create initial data script with:
- [ ] 1 ADMINISTRATOR account
- [ ] 5 APPLICANT accounts:
  - 2 from Vietnam
  - 2 from Singapore
  - 1 from another nation
  - 2 Premium accounts (1 from Vietnam, 1 from Singapore)
  - Each with complete profiles (skills, education, experience)

#### 4.2 Docker Deployment
- [ ] Build backend Docker image
- [ ] Build frontend Docker image
- [ ] Configure docker-compose with MongoDB, Redis, Kafka
- [ ] Test full stack deployment locally
- [ ] Document deployment instructions

#### 4.3 Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] User manual
- [ ] Developer setup guide

---

### **Phase 5: Presentation Preparation (Week 7)**

#### 5.1 Demo Preparation
- [ ] Prepare demo script for all features
- [ ] Test on clean database
- [ ] Verify all Simplex requirements work
- [ ] Verify all Medium requirements work
- [ ] Verify all Ultimo requirements work (if implemented)

#### 5.2 Presentation Materials
- [ ] Demo video (optional)
- [ ] Live demo environment
- [ ] Architecture explanation slides
- [ ] Be ready to answer questions about:
  - Design decisions
  - API integration with JM
  - Database sharding implementation
  - Security measures
  - Real-time notification system

---

## **📊 Feature Checklist by Difficulty Level**

### **Simplex (Basic) - Must Have**
- ✅ Registration, Login, Logout
- ✅ Profile CRUD (basic fields)
- ✅ Job search and application submission
- ✅ JWT authentication
- ✅ Email verification
- ✅ CV/cover letter upload

### **Medium - Should Have**
- ✅ Input validation (frontend + backend)
- ✅ JWE tokens (encrypted)
- ✅ Brute-force protection
- ✅ Education and experience management
- ✅ Skills tagging
- ✅ Full-text search on jobs
- ✅ Lazy loading/pagination
- ✅ Avatar upload with image resizing
- ✅ Premium subscription with payment
- ✅ Responsive UI

### **Ultimo (Advanced) - Nice to Have**
- ✅ Google OAuth SSO
- ✅ Country-based MongoDB sharding
- ✅ Shard migration on country update
- ✅ Redis caching
- ✅ Kafka integration for real-time notifications
- ✅ Premium job matching algorithm
- ✅ WebSocket for live notifications
- ✅ Token refresh mechanism
- ✅ Headless UI architecture

---

## **🔗 API Requirements**

### **APIs We Provide to Job Manager**
1. `GET /api/applicants/{id}` - Applicant profile data
2. `GET /api/applications?jobPostId={id}` - Applications for a job post
3. `POST /api/auth/verify` - JA system authorization

### **APIs We Consume from Job Manager**
1. `GET /api/jobs` - Job post listings
2. `GET /api/jobs/{id}` - Job post details
3. `GET /api/companies/{id}` - Company profile
4. `POST /api/payments` - Payment processing
5. `POST /api/auth/verify` - JM system authorization

---

## **🚀 Quick Start (After Implementation)**

### **Prerequisites**
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas account
- Redis instance
- Kafka cluster
- Firebase/Cloudinary account

### **Local Development**

```bash
# 1. Clone the repository
git clone <repository-url>
cd JobApplicant

# 2. Start infrastructure (MongoDB, Redis, Kafka)
docker-compose up -d

# 3. Start Backend
cd backend
mvn spring-boot:run

# 4. Start Frontend (in another terminal)
cd frontend
npm install
npm start

# 5. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

---

## **🔐 Authentication API (Completed)**

### **Overview**
The authentication system is fully implemented with comprehensive security features including Redis-based token blacklisting, brute-force protection, and email-based account activation and password reset.

### **Available Endpoints**

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/register` | POST | Register new user with email activation | No |
| `/activate` | GET | Activate account using email token | No |
| `/login` | POST | Login and receive JWT tokens | No |
| `/logout` | POST | Logout and blacklist tokens | Yes |
| `/check-session` | GET | Validate current session | Yes |
| `/refresh` | POST | Refresh access token | No |
| `/forgot-password` | POST | Request password reset email | No |
| `/reset-password` | POST | Reset password using email token | No |
| `/swagger-ui.html` | GET | API documentation interface | No |

### **Testing the API**

#### **Option 1: Postman Collection (Recommended)**
```bash
# Import the provided Postman collection
File: backend/JobApplicant_Auth_API.postman_collection.json

# Collection includes:
- 10 pre-configured API requests with examples
- Automated token management
- Test scripts for validation
- Complete test scenarios
```

#### **Option 2: Swagger UI**
```
# Start the backend server
cd backend
./mvnw spring-boot:run

# Access Swagger UI
http://localhost:8080/swagger-ui.html
```

#### **Option 3: curl Commands**
```bash
# 1. Register a new user
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "country": "Vietnam",
    "phoneNumber": "+84987654321",
    "address": "123 Example St",
    "city": "Ho Chi Minh City"
  }'

# 2. Activate account (use token from email)
curl -X GET http://localhost:8080/activate \
  -H "Content-Type: application/json" \
  -d '{"token": "your-activation-token"}'

# 3. Login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### **Security Features**

#### **Redis-Based Token Blacklist**
- All tokens are blacklisted upon logout
- Blacklisted tokens are rejected by the authentication filter
- Tokens expire automatically (access: 24h, refresh: 7 days)
- Monitor Redis in real-time: `redis-cli MONITOR`

#### **Brute-Force Protection**
- Rate limiting: Max 5 login attempts per 60 seconds
- Tracked per email address in Redis
- Returns HTTP 429 when limit exceeded
- Automatic reset after successful login

#### **Email Integration**
- Resend email service for reliable delivery
- Activation emails (24-hour token expiry)
- Password reset emails (1-hour token expiry)
- Configurable sender address via environment variables

### **Environment Configuration**

Required environment variables (`.env` file):
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/

# Redis (Token blacklist & rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Service (Resend)
MAIL_USERNAME=resend
MAIL_PASSWORD=your_resend_api_key
MAIL_FROM=noreply@yourdomain.com

# Server
SERVER_PORT=8080
FRONTEND_BASE_URL=http://localhost:3000
```

### **Monitoring Redis Activity**

To see real-time Redis commands during authentication operations:
```bash
# Terminal 1: Start Redis monitor
redis-cli MONITOR

# Terminal 2: Perform authentication actions
# You will see commands like:
# - SET "login_attempts:email@example.com" "1" EX 60
# - INCR "login_attempts:email@example.com"
# - SET "blacklist:token..." "revoked" EX 1440
# - EXISTS "blacklist:token..."
```

### **Testing Checklist**
- [x] User registration with email delivery ✅
- [x] Account activation via email token ✅
- [x] Login with JWT token generation ✅
- [x] Session validation ✅
- [x] Token refresh mechanism ✅
- [x] Password reset flow ✅
- [x] Logout with token blacklisting ✅
- [x] Brute-force protection (429 after 5 attempts) ✅
- [x] Blacklisted token rejection (403 after logout) ✅

---

## **👥 Team - Son Tinh Squad**

| Name | Student ID | Role | Contribution |
|------|------------|------|--------------|
| Tran Minh Truong | s3891643 | Full Stack | 20% |
| Dinh Xuan Minh | s3891847 | Full Stack | 20% |
| Huynh Ngoc Duy | s3924704 | Full Stack | 20% |
| Huynh Nhat Anh | s3924763 | Full Stack | 20% |
| Nguyen Viet Quan | s3926217 | Full Stack | 20% |

---

## **📚 Documentation**

- [SRS Document](Docs/EEET2582_DevVision-JobApplicant-v1.1.pdf)
- [Architecture Documentation](Docs/Milestone%201/ISYS3461_Mileston1_JA_SonTinh.pdf)
- [C4 Diagrams](Docs/Diagram/C4/)
- [ERD](Docs/Diagram/Squad%20ERD/DEVision%20ERD.png)

---

## **📝 License**

This project is part of RMIT University coursework for **EEET2582/ISYS3461 - System Architecture and Design**.
All materials are used strictly for educational and assessment purposes.

---

## **🔄 Project Status**

- ✅ **Milestone 1**: Architecture & Documentation (Completed - November 2025)
- 🚧 **Milestone 2**: Implementation (In Progress - Due January 13, 2026)

---

**Vietnamese Tradition**: *"An Cư Lạc Nghiệp"* (Settled and Flourished)
*Building careers, empowering futures.*
