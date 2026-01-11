#!/bin/bash
# DEVision Job Applicant - Cloud Deployment Script
# Deploys all services to DigitalOcean droplets by cloning repo and building

set -e

echo "=== DEVision Cloud Deployment ==="
echo ""

# Droplet IPs
GATEWAY_IP="152.42.229.163"
APP_IP="143.198.94.118"
KAFKA_IP="139.59.245.23"

# GitHub repo
REPO="https://github.com/ISYS3461-2025C-SonTinh-DEVision/JobApplicant.git"
BRANCH="main"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Deploying Kafka (Message Broker) to $KAFKA_IP${NC}"
ssh -o StrictHostKeyChecking=no root@$KAFKA_IP << EOF
  echo "Cleaning up..."
  rm -rf /opt/devision
  mkdir -p /opt/devision
  cd /opt/devision
  
  echo "Creating Kafka docker-compose..."
  cat > docker-compose.yml << 'COMPOSE'
services:
  kafka:
    image: apache/kafka:latest
    container_name: JA_kafka
    restart: unless-stopped
    ports:
      - "9092:9092"
    environment:
      - KAFKA_NODE_ID=1
      - KAFKA_PROCESS_ROLES=broker,controller
      - KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$KAFKA_IP:9092
      - KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    volumes:
      - kafka_data:/var/lib/kafka/data
volumes:
  kafka_data:
COMPOSE

  docker compose down 2>/dev/null || true
  docker compose up -d
  echo "Kafka started on port 9092!"
EOF
echo -e "${GREEN}✓ Kafka deployed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Deploying Application to $APP_IP${NC}"
ssh -o StrictHostKeyChecking=no root@$APP_IP << EOF
  echo "Cleaning up..."
  rm -rf /opt/devision
  mkdir -p /opt/devision
  cd /opt/devision
  
  echo "Cloning repository..."
  git clone --depth 1 --branch $BRANCH $REPO repo
  cd repo
  
  echo "Creating production env files..."
  cat > backend/.env << 'ENVFILE'
MONGODB_URI=mongodb+srv://Duy_database:duy123@ja-db.jmquovd.mongodb.net/?appName=JA-DB
JOB_MANAGER_BASE_URL=https://jobmanager-backend-production.up.railway.app
JOB_MANAGER_SERVICE_URL=https://jobmanager-backend-production.up.railway.app/
JOB_MANAGER_SERVICE_EMAIL=user@example.com
JOB_MANAGER_SERVICE_PASSWORD=StrongP@ssw0rd!
SERVER_PORT=8080
FRONTEND_BASE_URL=https://ja.devision.sbs
BACKEND_BASE_URL=https://ja.devision.sbs
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
CLOUDINARY_CLOUD_NAME=dqzu7jzkm
CLOUDINARY_API_KEY=215848137147388
CLOUDINARY_API_SECRET=46Ox-MmBsoiXG-wtt5FjbNymnn4
GOOGLE_CLIENT_ID=349111704986-depb0lctln2u9v98pddd9qrvuas78nn1.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
MAIL_USERNAME=resend
MAIL_PASSWORD=re_G55pzSV1_JUUwcoJSoayZD2Nux6RRtfz7
MAIL_FROM=noreply@ja.devision.sbs
ENVFILE

  cat > JA_frontend/.env << 'ENVFILE'
REACT_APP_API_URL=https://ja.devision.sbs
REACT_APP_API_GATEWAY_URL=https://ja.devision.sbs
REACT_APP_GOOGLE_CLIENT_ID=349111704986-depb0lctln2u9v98pddd9qrvuas78nn1.apps.googleusercontent.com
REACT_APP_CONSUL_URL=http://$GATEWAY_IP:8500
REACT_APP_DEBUG=false
ENVFILE

  echo "Creating production docker-compose..."
  cat > docker-compose.prod.yml << 'COMPOSE'
services:
  backend:
    build: ./backend
    container_name: JA_backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - ./backend/.env
    environment:
      SPRING_KAFKA_BOOTSTRAP_SERVERS: $KAFKA_IP:9092
      REDIS_HOST: redis
      SPRING_REDIS_HOST: redis
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 90s

  frontend:
    build: ./JA_frontend
    container_name: JA_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - ./JA_frontend/.env

  redis:
    image: redis:7-alpine
    container_name: JA_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
COMPOSE

  docker compose -f docker-compose.prod.yml down 2>/dev/null || true
  docker compose -f docker-compose.prod.yml up -d --build
  echo "Application services started!"
EOF
echo -e "${GREEN}✓ Application deployed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Deploying Gateway to $GATEWAY_IP${NC}"
ssh -o StrictHostKeyChecking=no root@$GATEWAY_IP << EOF
  echo "Cleaning up..."
  rm -rf /opt/devision
  mkdir -p /opt/devision
  cd /opt/devision
  
  echo "Creating Kong config..."
  cat > kong.yml << 'KONGCONFIG'
_format_version: "3.0"
_transform: true

services:
  - name: ja-backend
    url: http://$APP_IP:8080
    routes:
      - name: api-route
        paths:
          - /api
        strip_path: false
    plugins:
      - name: cors
        config:
          origins: ["*"]
          methods: [GET, POST, PUT, PATCH, DELETE, OPTIONS]
          headers: [Accept, Content-Type, Authorization, X-Requested-With]
          credentials: true
          max_age: 3600

  - name: ja-frontend
    url: http://$APP_IP:3000
    routes:
      - name: frontend-route
        paths:
          - /
        strip_path: false

  - name: actuator-service
    url: http://$APP_IP:8080
    routes:
      - name: actuator-route
        paths:
          - /actuator
        strip_path: false

plugins:
  - name: rate-limiting
    config:
      minute: 300
      policy: local
KONGCONFIG

  echo "Creating docker-compose..."
  cat > docker-compose.yml << 'COMPOSE'
services:
  kong:
    image: kong:3.4
    container_name: JA_kong
    restart: unless-stopped
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_PROXY_LISTEN: 0.0.0.0:8000
    volumes:
      - ./kong.yml:/kong/kong.yml:ro
    ports:
      - "80:8000"
      - "8001:8001"

  consul:
    image: hashicorp/consul:1.17
    container_name: JA_consul
    restart: unless-stopped
    command: agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
    volumes:
      - consul_data:/consul/data
    ports:
      - "8500:8500"

volumes:
  consul_data:
COMPOSE

  docker compose down 2>/dev/null || true
  docker compose up -d
  echo "Gateway services started!"
EOF
echo -e "${GREEN}✓ Gateway deployed${NC}"
echo ""

echo "=============================================="
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo "=============================================="
echo ""
echo "Service Endpoints:"
echo "  Frontend:     http://$GATEWAY_IP"
echo "  API:          http://$GATEWAY_IP/api"
echo "  Consul UI:    http://$GATEWAY_IP:8500"
echo "  Backend:      http://$APP_IP:8080"
echo "  Kafka:        $KAFKA_IP:9092"
echo ""
echo -e "${YELLOW}DNS Configuration Required:${NC}"
echo "Add these records in Cloudflare for ja.devision.sbs:"
echo "  Type: A    Name: @    Value: $GATEWAY_IP"
echo "  Proxy: ON (orange cloud)"
echo "  SSL: Full (strict)"
echo ""
echo "After DNS propagation, test:"
echo "  curl https://ja.devision.sbs/actuator/health"
