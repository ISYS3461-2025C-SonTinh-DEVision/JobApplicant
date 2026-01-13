# DEVision Job Applicant - Kubernetes Deployment Guide

## Overview
This directory contains Kubernetes manifests for deploying the Job Applicant subsystem.
Implements **Ultimo D.3.4**: Deploy the DEVision ecosystem using Kubernetes.

## Architecture (Kubernetes)

```
                    ┌─────────────────────────────────────────────────────┐
                    │                    Kubernetes Cluster               │
                    │                                                     │
  ┌───────┐         │  ┌───────────┐   ┌────────────┐   ┌────────────┐  │
  │ Users │────────▶│  │  Ingress  │──▶│    Kong    │──▶│  Backend   │  │
  └───────┘         │  │ Controller│   │  Gateway   │   │ (2 pods)   │  │
                    │  └───────────┘   └────────────┘   └────────────┘  │
                    │        │                                  │        │
                    │        │         ┌────────────┐    ┌──────▼─────┐ │
                    │        └────────▶│  Frontend  │    │   Redis    │ │
                    │                  │ (2 pods)   │    │   Cache    │ │
                    │                  └────────────┘    └────────────┘ │
                    │                                                    │
                    │  ┌────────────┐     ┌───────────────────────────┐ │
                    │  │   Consul   │     │    External Services      │ │
                    │  │ Discovery  │     │  • MongoDB Atlas          │ │
                    │  └────────────┘     │  • Confluent Kafka        │ │
                    │                     │  • Cloudinary             │ │
                    └─────────────────────│  • Job Manager API        │──┘
                                          └───────────────────────────┘
```

## Directory Structure

```
k8s/
├── base/                      # Base manifests
│   ├── namespace.yaml         # Namespace: devision-ja
│   ├── configmap.yaml         # Non-sensitive config
│   ├── secrets.yaml           # Sensitive credentials (template)
│   ├── backend-deployment.yaml    # Backend (2 replicas)
│   ├── frontend-deployment.yaml   # Frontend (2 replicas)
│   ├── redis-deployment.yaml      # Redis cache
│   ├── kong-deployment.yaml       # API Gateway
│   ├── consul-deployment.yaml     # Service Discovery
│   ├── ingress.yaml               # External access
│   └── kustomization.yaml         # Kustomize config
├── overlays/
│   ├── dev/                   # Development overrides
│   └── prod/                  # Production overrides
└── README.md                  # This file
```

## Prerequisites

1. **Kubernetes Cluster** (minikube, kind, or cloud provider)
2. **kubectl** configured to access cluster
3. **Docker images** built and available:
   ```bash
   docker build -t jobapplicant-backend ./backend
   docker build -t jobapplicant-frontend ./JA_frontend
   ```

## Quick Start (Development)

### 1. Create namespace and deploy all resources
```bash
kubectl apply -k k8s/base/
```

### 2. Verify deployment
```bash
kubectl get all -n devision-ja
```

### 3. Access services (minikube)
```bash
# Enable ingress
minikube addons enable ingress

# Get minikube IP
minikube ip

# Add to /etc/hosts:
# <minikube-ip> ja.devision.local api.ja.devision.local consul.ja.devision.local
```

### 4. Access via port-forward (alternative)
```bash
# Frontend
kubectl port-forward svc/ja-frontend 3000:3000 -n devision-ja

# API Gateway
kubectl port-forward svc/kong-gateway 8000:8000 -n devision-ja

# Consul UI
kubectl port-forward svc/consul 8500:8500 -n devision-ja
```

## Configuration

### Update Secrets
Before deploying, update `k8s/base/secrets.yaml` with real credentials:
```bash
# Edit secrets (base64 encode if needed)
kubectl apply -f k8s/base/secrets.yaml
```

### Environment-specific Overrides
Use overlays for different environments:
```bash
# Development
kubectl apply -k k8s/overlays/dev/

# Production
kubectl apply -k k8s/overlays/prod/
```

## Scaling

```bash
# Scale backend
kubectl scale deployment ja-backend --replicas=3 -n devision-ja

# Scale frontend
kubectl scale deployment ja-frontend --replicas=3 -n devision-ja
```

## Monitoring

```bash
# View logs
kubectl logs -f deployment/ja-backend -n devision-ja
kubectl logs -f deployment/ja-frontend -n devision-ja

# Check pod status
kubectl describe pods -n devision-ja

# View resource usage
kubectl top pods -n devision-ja
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/base/

# Or delete namespace (removes everything)
kubectl delete namespace devision-ja
```

## Requirements Compliance

| Requirement | Implementation |
|-------------|----------------|
| D.3.4 | ✅ Kubernetes deployment with all manifests |
| D.3.1 | ✅ Kong API Gateway for routing |
| D.3.1 | ✅ Consul for Service Discovery |
| D.3.3 | ✅ API Gateway separate from frontend/backend |
| D.3.3 | ✅ Backend with 2+ replicas (scalable) |
| D.3.2 | ✅ Kafka via Confluent Cloud (external) |

## Production Considerations

1. **TLS/HTTPS**: Uncomment TLS section in ingress.yaml
2. **Secrets Management**: Use Kubernetes Secrets or external vault
3. **Resource Limits**: Adjust CPU/memory in deployments
4. **Persistence**: Configure appropriate StorageClass for PVCs
5. **Monitoring**: Add Prometheus/Grafana stack
6. **Auto-scaling**: Configure HorizontalPodAutoscaler
