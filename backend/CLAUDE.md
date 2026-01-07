# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Maven Commands
- **Build the project**: `./mvnw clean package`
- **Build skipping tests**: `./mvnw clean package -DskipTests`
- **Run tests**: `./mvnw test`
- **Run a single test class**: `./mvnw test -Dtest=ClassName`
- **Run a specific test method**: `./mvnw test -Dtest=ClassName#methodName`
- **Clean build artifacts**: `./mvnw clean`
- **Download dependencies offline**: `./mvnw dependency:go-offline`

### Running the Application
- **Run locally**: `./mvnw spring-boot:run`
- **Run with specific profile**: `./mvnw spring-boot:run -Dspring-boot.run.profiles=test`
- **Run the JAR**: `java -jar target/JobApplicant-0.0.1-SNAPSHOT.jar`

### Docker Commands
- **Build Docker image**: `docker build -t jobapplicant-backend .`
- **Run Docker container**: `docker run -p 8080:8080 --env-file .env jobapplicant-backend`

### API Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui.html (when app is running)
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## Architecture Overview

### Technology Stack
- **Framework**: Spring Boot 3.5.8 with Java 21
- **Database**: MongoDB (NoSQL document store)
- **Cache/Tokens**: Redis (token blacklist, rate limiting)
- **Messaging**: Apache Kafka (job post events)
- **Real-time**: WebSocket with STOMP protocol
- **File Storage**: Cloudinary
- **Payment**: Stripe API
- **Email**: Resend HTTP API
- **Security**: Spring Security with JWE tokens (RSA-OAEP-256 + A256GCM encryption)

### Module Structure

The codebase follows a **modular layered architecture** with domain-driven design:

```
src/main/java/com/DEVision/JobApplicant/
├── auth/                  # Authentication & user management
├── applicant/             # Applicant profile management
├── application/           # Job application submissions
├── searchProfile/         # Job search profiles & matching
├── jobManager/jobpost/    # Integration with external Job Manager system
├── notification/          # Notification system (WebSocket-based)
├── subscription/          # Subscription & payment management
├── jwt/                   # Token generation & verification (JWE)
├── filter/                # Security filters (auth, system-to-system)
└── common/                # Shared utilities, config, storage, email
```

#### Layer Pattern Within Each Module
Each module follows a consistent layering:
- **controller/**: REST API endpoints
- **entity/**: MongoDB document models (annotated with `@Document`)
- **repository/**: Spring Data MongoDB repositories
- **service/**: Core business logic
- **internal/service**: Internal implementation details
- **external/service**: Services exposed to other modules
- **dto/**: Data transfer objects for API requests/responses
- **config/**: Module-specific configuration

### Key Architectural Patterns

#### 1. Authentication Flow
- **Local Auth**: Email/password with BCrypt hashing, activation tokens via email
- **Google SSO**: ID token verification flow (not OAuth2 redirect)
- **Tokens**: JWE tokens (not plain JWT) with RSA encryption stored in HttpOnly cookies
- **Token Management**: Redis-based blacklist for logout, 24h access tokens, 7d refresh tokens
- **Rate Limiting**: Redis-based (e.g., 5 login attempts per 60s)

#### 2. System-to-System Communication
- **Job Manager Integration**: REST API calls with `X-System-Authorization` header
- **SystemAuthFilter**: Validates system tokens before user authentication filter
- **Used for**: Application submission callbacks, job post synchronization

#### 3. Event-Driven Architecture
- **Kafka Topic**: `job-post-events`
- **Consumer**: `JobPostEventConsumer` in searchProfile module
- **Flow**: JM publishes job posts → Consumer matches against search profiles → Creates MatchedJobPost → Notifies premium users via WebSocket

#### 4. Real-time Notifications
- **WebSocket Endpoint**: `/ws/notifications`
- **Protocol**: STOMP over WebSocket with SockJS fallback
- **Service**: `WebSocketNotificationService` broadcasts to `/topic/notifications/{userId}`
- **Use Cases**: Job match alerts, application status updates

#### 5. File Upload Strategy
- **Storage**: Cloudinary (not local filesystem)
- **Endpoints**: `/api/storage/upload`, `/api/storage/{publicId}` (delete)
- **Used for**: CV uploads, cover letters, avatars, portfolio items
- **Max sizes**: Configured in `application.yml` (100MB file, 200MB request)

### MongoDB Collections

Key collections (not exhaustive):
- **account**: User entities with roles (APPLICANT, COMPANY, ADMIN, SYSTEM)
- **applicants**: Profile data with embedded education, experience, skills
- **applications**: Job applications with Cloudinary file URLs and status tracking
- **search_profiles**: User job search criteria
- **matched_job_posts**: Pre-computed job matches with scores
- **notifications**: User notifications with read status
- **subscriptions**: User subscription plans (FREEMIUM, PREMIUM)
- **payment_transactions**: Stripe payment records

### Security Configuration

#### Public Endpoints (no auth required)
- `/api/auth/*` (login, register, password reset)
- `/api/job-posts/**` (public job search)
- `/api/countries`
- `/swagger-ui/**`, `/v3/api-docs/**`
- `/ws/**` (WebSocket handshake)

#### Protected Endpoints (require authentication)
- `/api/applicants/**` (profile management)
- `/api/applications/**` (except system callbacks)
- `/api/search-profiles/**`
- `/api/subscriptions/**`
- `/api/storage/**`

#### System Endpoints (require system token)
- `/api/applications/job/**` (Job Manager callbacks)
- `/api/system/verify-token`

### Environment Variables

Required environment variables (see `application.yml`):
- **Database**: `MONGODB_URI`
- **Cache**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Messaging**: `KAFKA_BOOTSTRAP_SERVERS`
- **Storage**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Payment**: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Email**: `MAIL_PASSWORD` (Resend API key)
- **Integration**: `JOB_MANAGER_BASE_URL`
- **OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **App**: `SERVER_PORT`, `FRONTEND_BASE_URL`

### Integration Points

#### External Job Manager System
- **Service**: `CallJobPostService` uses `RestTemplate`
- **Base URL**: Configured via `JOB_MANAGER_BASE_URL`
- **Authentication**: OAuth2 client credentials or system token
- **Endpoints Called**: GET job posts with pagination, filters, sorting

#### Stripe Payment Flow
- **Client**: `StripeClient` in subscription module
- **Webhook**: `/api/subscriptions/payment-callback` for async confirmations
- **Flow**: User upgrades → Create payment intent → Process via Stripe → Update subscription status

#### Cloudinary File Management
- **Service**: `CloudinaryService` implements `FileStorageService`
- **Operations**: Upload (returns URL + publicId), delete (by publicId)
- **Configuration**: Injected from `cloudinary.*` properties

### Testing Configuration

Test profile uses `application-test.yml`:
- Separate MongoDB database: `JA-DB-TEST`
- Local Redis instance (database 1)
- Mock SMTP server configuration

## Important Development Notes

### When Working with Authentication
- Never modify the JWE encryption algorithm (RSA-OAEP-256 + A256GCM) without coordination
- Always check Redis blacklist before accepting tokens in filters
- SSO users (authProvider="google") cannot change passwords per SRS requirements
- Password validation enforces: 8+ chars, uppercase, lowercase, digit, special char

### When Working with File Uploads
- All file operations go through Cloudinary, not local filesystem
- Always delete old files when updating (use publicId from entity)
- Multipart file size limits are configured in `application.yml`

### When Working with Applications
- Application submissions trigger external API call to Job Manager system
- Check for duplicate applications (same applicant + job post)
- Status updates may require webhook notifications back to JM system

### When Working with Subscriptions
- Plan upgrades must update both Subscription entity and User.planType
- Premium features: salary notifications, unlimited job matches
- Freemium limitations: basic job matching only

### When Working with Notifications
- Always use `WebSocketNotificationService` for real-time delivery
- Persist notifications in database even if WebSocket delivery fails
- Mark notifications as read via dedicated endpoint, not direct repo update

### Common Patterns
- **Error Handling**: Use `GlobalExceptionHandler` for consistent error responses
- **Validation**: Use Jakarta Bean Validation (`@Valid`) on DTOs
- **Auditing**: MongoDB entities auto-track `createdAt`/`updatedAt` via `@CreatedDate`/`@LastModifiedDate`
- **Pagination**: Use Spring Data's `Pageable` for list endpoints
- **CORS**: Configured in `CorsConfig` to allow frontend origin
