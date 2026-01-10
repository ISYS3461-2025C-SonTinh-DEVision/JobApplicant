# API Gateway & Service Discovery

This document explains the API Gateway (Kong) and Service Discovery (Consul) setup for DEVision Job Applicant system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser / Client                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (React) :3000                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ API calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                API Gateway (Kong) :8000                          │
│    • Routes /api/* to Backend                                    │
│    • Rate limiting (100 req/min)                                 │
│    • CORS handling                                               │
│    • Request logging                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────┐ ┌────────────────┐
│   JA Backend    │ │   Consul    │ │     Redis      │
│   :8080         │ │   :8500     │ │     :6379      │
│   Spring Boot   │ │   Service   │ │     Cache      │
│                 │ │   Registry  │ │                │
└─────────────────┘ └─────────────┘ └────────────────┘
         │
         ▼
┌─────────────────┐
│     Kafka       │
│     :29092      │
│   Messaging     │
└─────────────────┘
```

## Quick Start

```bash
# Start all services
docker compose up -d --build

# Check service status
docker compose ps

# View logs
docker compose logs -f kong consul
```

## Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| API Gateway | http://localhost:8000 | Kong proxy (use for API calls) |
| Kong Admin | http://localhost:8001 | Kong admin API |
| Consul UI | http://localhost:8500 | Service discovery dashboard |
| Backend (direct) | http://localhost:8080 | Spring Boot API |
| Backend Health | http://localhost:8080/actuator/health | Health check endpoint |

## Kong Gateway

### Configuration
Kong uses declarative configuration in `gateway/kong.yml`:
- **Routes**: All `/api/*` requests → Backend :8080
- **Plugins**: CORS, Rate Limiting (100/min), File Logging

### Verify Kong is Working
```bash
# Check Kong status
curl http://localhost:8001/status

# Test routing through Kong
curl http://localhost:8000/api/auth/health

# View configured routes
curl http://localhost:8001/routes
```

## Consul Service Discovery

### Configuration
Consul configuration in `consul/config.json` registers:
- ja-backend (Spring Boot)
- ja-frontend (React)
- kong-gateway
- redis-cache
- kafka-broker

### Access Consul UI
Open http://localhost:8500 in browser to see:
- All registered services
- Health check status
- Service details

### Query Services via API
```bash
# List all services
curl http://localhost:8500/v1/catalog/services

# Get specific service info
curl http://localhost:8500/v1/catalog/service/ja-backend

# Check service health
curl http://localhost:8500/v1/health/service/ja-backend
```

## Health Checks

All services expose health endpoints for monitoring:

| Service | Health Endpoint |
|---------|-----------------|
| Backend | `GET /actuator/health` |
| Kong | `GET :8001/status` |
| Redis | TCP ping on :6379 |
| Kafka | TCP check on :9092 |

## Troubleshooting

### Kong Not Routing Requests
```bash
# Check Kong config
docker compose logs kong

# Reload Kong config
docker compose restart kong
```

### Consul Services Not Healthy
```bash
# Check Consul logs
docker compose logs consul

# Verify service connectivity
docker compose exec consul consul members
```

### Backend Health Check Failing
```bash
# Check if actuator is exposed
curl http://localhost:8080/actuator/health

# View backend logs
docker compose logs backend
```

## Ultimo Requirements Met

- ✅ **D.2.1**: API Gateway and Service Discovery are Dockerized
- ✅ **D.3.1**: Communication uses API Gateway and Service Discovery
- ✅ **D.3.3**: API Gateway & Service Discovery hosted separately from frontends/backends
