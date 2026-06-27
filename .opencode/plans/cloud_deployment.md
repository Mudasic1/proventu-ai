# Cloud Deployment Architecture

> **System**: SalesEasy AI / Proventu AI - Multi-Agent AI System
> **Deployment Target**: Alibaba Cloud (International - Singapore ap-southeast-1)
> **Orchestration**: ACK Basic (Managed Kubernetes) free control plane
> **Database**: Neon Postgres (existing, no migration)
> **AI**: Qwen models via Alibaba Cloud Model Studio API
> **Frontend**: Next.js 16.2.6 (`output: "standalone"`)
> **Backend**: Python 3.13+ FastAPI with OpenAI Agents SDK + MCP

---

## 1. Architecture Overview

### 1.1 Traffic Flow

```
                         +-----------------------------------+
                         |   Alibaba Cloud Model Studio    |
                         |   (Qwen3.7-Max / Flash API)     |
                         +--------------+------------------+
                                      | HTTPS
                                      |
  User --HTTPS--> ALB --> ACK Basic ---+
                    |                    
                    |           +--------v--------+
                    |           | FastAPI Backend |
                    |           | Agent Runner    |
                    |           | MCP Servers     |
                    |           | Worker Queue    |
                    |           +--------+--------+
                    |                    |
                    |           +--------v--------+
                    |           | Neon Postgres   |
                    |           | + pgvector      |
                    |           +-----------------+
                    |                    |
                    |           +--------v--------+
                    |           | Redis (in-      |
                    |           | cluster)        |
                    |           | Queue + Cache   |
                    |           +-----------------+
                    |
                    v
           +----------------+
           | Next.js        |
           | Frontend       |
           | (:3000)        |
           +----------------+
```

### 1.2 VPC Topology

```
VPC: 10.0.0.0/16 (ap-southeast-1)
  Public Subnet A (10.0.1.0/24) -- ALB (Internet-facing), NAT Gateway
  Public Subnet B (10.0.2.0/24) -- ALB (multi-AZ)
  Private Subnet A (10.0.10.0/24) -- ACK Worker Nodes, Redis
  Private Subnet B (10.0.11.0/24) -- ACK Worker Nodes (multi-AZ)
```

### 1.3 Service-to-Service Communication

| Source | Dest | Protocol | Port | Notes |
|--------|------|----------|------|-------|
| User | ALB | HTTPS | 443 | SSL termination at ALB |
| ALB | Next.js Pod | HTTP | 3000 | ClusterIP service |
| ALB | FastAPI Pod | HTTP | 8000 | WebSocket/SSE supported |
| FastAPI | Model Studio | HTTPS | 443 | OpenAI-compatible API |
| FastAPI | Neon Postgres | PostgreSQL SSL | 5432 | External public endpoint |
| FastAPI | Redis | Redis | 6379 | In-cluster |
| Next.js | Neon Postgres | PostgreSQL SSL | 5432 | Server-side fetching |
| Next.js | FastAPI | HTTP | 8000 | Internal via ClusterIP |

---

## 2. Containerisation

### 2.1 Frontend Dockerfile (new)

Path: `frontend/Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
```

### 2.2 Backend Dockerfile (upgraded)

Path: `backend-ai/Dockerfile`

Changes from current: multi-stage build, `--workers 2`, HEALTHCHECK, `--limit-max-requests 1000`, `--timeout-keep-alive 65`

```dockerfile
# syntax=docker/dockerfile:1

# Build Stage
FROM python:3.13-slim AS builder
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml README.md main.py ./
RUN pip install --no-cache-dir --upgrade pip && pip wheel --no-cache-dir --wheel-dir /wheels .

# Production Stage
FROM python:3.13-slim AS runner
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*.whl && rm -rf /wheels
COPY app ./app
USER app
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --retries=3 CMD python -c 'import urllib.request; urllib.request.urlopen("http://localhost:8000/health")' || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--limit-max-requests", "1000", "--timeout-keep-alive", "65"]
```

### 2.3 Frontend .dockerignore (new)

Path: `frontend/.dockerignore`

```
node_modules
.next
.git
*.md
.env
.env.*
!.env.example
public/images/raw
tests
coverage
```
### 2.4 Docker Compose (new)

Path: `docker-compose.yml`

```yaml
version: "3.9"

x-backend-env: &backend-env
  DATABASE_URI: ${DATABASE_URI:?required}
  AI_BACKEND_SHARED_SECRET: ${AI_BACKEND_SHARED_SECRET:?required}
  QWEN_API_KEY: ${QWEN_API_KEY:-}
  QWEN_ORCHESTRATOR_MODEL: ${QWEN_ORCHESTRATOR_MODEL:-qwen3.7-max}
  QWEN_SUBAGENT_MODEL: ${QWEN_SUBAGENT_MODEL:-qwen3.5-flash}
  REDIS_URL: redis://redis:6379/0
  DISABLE_TRACING: "true"

x-frontend-env: &frontend-env
  DATABASE_URI: ${DATABASE_URI:?required}
  DATABASE_DIRECT_URI: ${DATABASE_DIRECT_URI:?required}
  BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET:?required}
  BETTER_AUTH_URL: http://localhost:3000
  NEXT_PUBLIC_BETTER_AUTH_URL: http://localhost:3000
  AI_BACKEND_URL: http://backend:8000
  AI_BACKEND_SHARED_SECRET: ${AI_BACKEND_SHARED_SECRET:?required}
  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
  STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:-}
  STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:-}

services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend-ai
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      <<: *backend-env
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 15s
      timeout: 5s
      retries: 3

  worker:
    build:
      context: ./backend-ai
    restart: unless-stopped
    command: ["python", "-m", "app.workers.run", "--concurrency", "2"]
    environment:
      <<: *backend-env
    depends_on:
      redis:
        condition: service_healthy
    profiles:
      - worker

  frontend:
    build:
      context: ./frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      <<: *frontend-env
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  redis-data:
```

Usage:

```powershell
docker compose up -d
docker compose --profile worker up -d
docker compose logs -f backend frontend
docker compose build backend && docker compose up -d backend
```

### 2.5 Backend .dockerignore (unchanged)

Path: `backend-ai/.dockerignore`

```
.venv
venv
__pycache__
*.pyc
.pytest_cache
.ruff_cache
coverage
*.log
.env
.env.*
!.env.example
tests
migrations
```

---

## 3. Container Registry (ACR)

### 3.1 Setup

```powershell
# Create ACR Personal Edition namespace
aliyun cr CreateNamespace --Namespace "saleseasyai"
```

### 3.2 Image Naming

```
registry.ap-southeast-1.aliyuncs.com/saleseasyai/frontend:{tag}
registry.ap-southeast-1.aliyuncs.com/saleseasyai/backend:{tag}
```

### 3.3 Build & Push

```powershell
docker build -t $REGISTRY/$NS/frontend:latest -f frontend/Dockerfile frontend/
docker push $REGISTRY/$NS/frontend:latest
docker build -t $REGISTRY/$NS/backend:latest -f backend-ai/Dockerfile backend-ai/
docker push $REGISTRY/$NS/backend:latest
```
---

## 4. ACK Basic Cluster Setup

### 4.1 Create Cluster

```powershell
# Create VPC
aliyun vpc CreateVpc --VpcName "saleseasyai-vpc" --CidrBlock "10.0.0.0/16" --RegionId "ap-southeast-1"

# Create VSwitches
aliyun vpc CreateVSwitch --VSwitchName "public-a" --VpcId "<vpc-id>" --CidrBlock "10.0.1.0/24" --ZoneId "ap-southeast-1a"
aliyun vpc CreateVSwitch --VSwitchName "public-b" --VpcId "<vpc-id>" --CidrBlock "10.0.2.0/24" --ZoneId "ap-southeast-1b"
aliyun vpc CreateVSwitch --VSwitchName "private-a" --VpcId "<vpc-id>" --CidrBlock "10.0.10.0/24" --ZoneId "ap-southeast-1a"
aliyun vpc CreateVSwitch --VSwitchName "private-b" --VpcId "<vpc-id>" --CidrBlock "10.0.11.0/24" --ZoneId "ap-southeast-1b"

# Create ACK Basic cluster
aliyun cs CreateCluster --cluster_type "managed_kubernetes" --name "saleseasyai-prod" --region_id "ap-southeast-1" --vpcid "<vpc-id>" --container_cidr "172.16.0.0/16" --service_cidr "172.17.0.0/16" --num_of_nodes 2 --instance_types "ecs.g7a.xlarge" --snat_entry true --endpoint_public_access true --deletion_protection true
```

### 4.2 Node Pool Configuration

| Property | Value |
|----------|-------|
| Instance type | `ecs.g7a.xlarge` (4vCPU, 8GB, AMD) |
| Node count | 2 (min), 6 (max) |
| OS | Alibaba Cloud Linux 3 |
| System disk | 40GB ESSD PL0 |
| Data disk | 100GB ESSD PL1 |
| Scaling mode | Auto (Cluster Autoscaler) |
| Billing | Pay-as-you-go (or 1-year subscription for ~40% off) |

### 4.3 Post-Creation Setup

```powershell
# Get kubeconfig
aliyun cs DescribeClusterUserKubeconfig --ClusterId "<cluster-id>" > kubeconfig
kubectl get nodes
```

### 4.4 Cluster Autoscaler

| Setting | Value |
|---------|-------|
| Min nodes | 2 |
| Max nodes | 6 |
| Scale-down delay | 10 minutes |
| Scale-up trigger | Pod pending due to resources |

---

## 5. ALB Ingress Configuration

### 5.1 Install ALB Ingress Controller

```powershell
# Install via ACK console: Add-ons > ALB Ingress Controller
# Or CLI:
aliyun cs InstallClusterAddons --cluster-id "<cluster-id>" --addons "[{\"name\":\"alb-ingress-controller\"}]"
```

### 5.2 AlbConfig

Path: `k8s/alb-config.yaml`

```yaml
apiVersion: alibabacloud.com/v1
kind: AlbConfig
metadata:
  name: saleseasyai-alb
  namespace: proventu-ai
spec:
  config:
    name: saleseasyai-alb
    addressType: Internet
    edition: Standard
    zoneMappings:
    - vSwitchId: <vswitch-public-a-id>
    - vSwitchId: <vswitch-public-b-id>
  listeners:
    - port: 80
      protocol: HTTP
      redirect:
        port: 443
        protocol: HTTPS
        httpCode: 301
    - port: 443
      protocol: HTTPS
      certificates:
        - certificateId: <your-cert-id>
```

### 5.3 Ingress Rules

Path: `k8s/ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: proventu-ai
  annotations:
    alb.ingress.kubernetes.io/alb-name: saleseasyai-alb
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80},{"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: "true"
    alb.ingress.kubernetes.io/healthcheck-enabled: "true"
    alb.ingress.kubernetes.io/healthcheck-path: "/health"
spec:
  ingressClassName: alb
  rules:
  - host: app.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-svc
            port:
              number: 8000
  tls:
  - hosts:
    - app.yourdomain.com
    secretName: tls-secret
```

### 5.4 WebSocket & SSE Support

ALB natively supports WebSocket and SSE. No extra configuration needed. For long-lived SSE/WebSocket connections:

```yaml
alb.ingress.kubernetes.io/keepalive-timeout: "300"
alb.ingress.kubernetes.io/idle-timeout: "300"
```

### 5.5 SSL Certificate

```powershell
# Apply free DigiCert DV via CAS Console (3-month, auto-renewable)
# Deploy to ALB from CAS console (one-click)
```

---

## 6. Neon Postgres (Existing)

### 6.1 Connection

Keep existing Neon Postgres. Access from ACK via public SSL endpoint.

### 6.2 Enable pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 6.3 Connection Configuration

```yaml
# K8s ConfigMap
DATABASE_URI: "postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require"
DATABASE_DIRECT_URI: "postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"
```

### 6.4 Connection Pooling

Neon provides built-in PgBouncer pooled endpoint (the `-pooler` hostname). Use pooled URI for apps, direct URI for migrations.

### 6.5 Expected Connections

| Source | Connections |
|--------|------------|
| FastAPI (2 pods x 2 workers) | ~12 |
| Next.js (2 pods) | ~10 |
| Workers (2 pods) | ~4 |
| **Total** | **~26** (well within limits) |

---

## 7. Redis

### 7.1 Option A: In-Cluster Redis (Recommended for MVP)

Simpler — runs as StatefulSet in ACK. Path: `k8s/redis-statefulset.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-svc
  namespace: proventu-ai
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: proventu-ai
spec:
  serviceName: redis-svc
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        volumeMounts:
        - name: redis-data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: redis-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
      storageClassName: alicloud-disk-essd
```

### 7.2 Option B: Managed Redis (Production at Scale)

```powershell
aliyun rds CreateDBInstance --Engine "Redis" --EngineVersion "7.0" --DBInstanceClass "redis.shard.small.ce" --DBInstanceStorage 1GB --NetworkType "VPC" --VpcId "<vpc-id>" --VSwitchId "<vswitch-private-a-id>" --ZoneId "ap-southeast-1a"
```

Monthly: ~$30-50/month (1GB, 2 replicas)

### 7.3 Backend Queue Configuration

```python
# backend-ai/app/core/queue.py (new)
from redis import Redis
from rq import Queue

redis_conn = Redis.from_url(settings.redis_url)
agent_queue = Queue("agent-tasks", connection=redis_conn, default_timeout=300)
```
---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions Workflow

Path: `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy to ACK

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ${{ secrets.ACR_REGISTRY }}
  NAMESPACE: ${{ secrets.ACR_NAMESPACE }}
  CLUSTER_ID: ${{ secrets.ACK_CLUSTER_ID }}
  K8S_NAMESPACE: proventu-ai

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, backend]
    steps:
      - uses: actions/checkout@v4

      - name: Login to ACR
        uses: aliyun/acr-login@v1
        with:
          region-id: ap-southeast-1
          access-key-id: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_ID }}
          access-key-secret: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_SECRET }}

      - name: Build & push
        run: |
          IMAGE_TAG=${{ github.sha }}
          docker build -t $REGISTRY/$NAMESPACE/${{ matrix.service }}:$IMAGE_TAG -t $REGISTRY/$NAMESPACE/${{ matrix.service }}:latest -f ${{ matrix.service }}/Dockerfile ${{ matrix.service }}/
          docker push $REGISTRY/$NAMESPACE/${{ matrix.service }} --all-tags

      - name: Set ACK context
        uses: aliyun/ack-set-context@v1
        with:
          access-key-id: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_ID }}
          access-key-secret: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_SECRET }}
          cluster-id: ${{ env.CLUSTER_ID }}

      - name: Deploy
        run: |
          kubectl set image deployment/${{ matrix.service }} -n $K8S_NAMESPACE ${{ matrix.service }}=$REGISTRY/$NAMESPACE/${{ matrix.service }}:${{ github.sha }}

      - name: Verify rollout
        run: |
          kubectl rollout status deployment/${{ matrix.service }} -n $K8S_NAMESPACE --timeout=120s

  deploy-workers:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    steps:
      - name: Set ACK context
        uses: aliyun/ack-set-context@v1
        with:
          access-key-id: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_ID }}
          access-key-secret: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_SECRET }}
          cluster-id: ${{ secrets.ACK_CLUSTER_ID }}

      - name: Restart workers
        run: |
          kubectl rollout restart deployment/worker -n proventu-ai
          kubectl rollout status deployment/worker -n proventu-ai --timeout=120s

  notify:
    needs: [build-and-deploy, deploy-workers]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Notify
        run: echo 'Deployment ${{ needs.build-and-deploy.result }}'
```

### 8.2 GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `ALIBABA_CLOUD_ACCESS_KEY_ID` | RAM user AccessKey |
| `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | RAM user Secret |
| `ACR_REGISTRY` | `registry.ap-southeast-1.aliyuncs.com` |
| `ACR_NAMESPACE` | `saleseasyai` |
| `ACK_CLUSTER_ID` | ACK cluster ID |
| `NEON_DATABASE_URI` | Neon pooled connection string |
| `AI_BACKEND_SHARED_SECRET` | Internal API secret |
| `QWEN_API_KEY` | Alibaba Model Studio API key |

---

## 9. Monitoring & Observability

### 9.1 Log Collection (SLS)

Enable SLS during ACK cluster creation or via:

```powershell
aliyun cs InstallClusterAddons --cluster-id "<cluster-id>" --addons "[{\"name\":\"logtail-ds\"}]"
```

SLS collects: container stdout/stderr with K8s metadata, audit logs, node logs.
30-day hot retention. Approx cost at 5GB/day: ~$33/month.

### 9.2 Structured Logging

Update `backend-ai/app/core/logging.py` to output JSON:

```python
import json, logging, sys

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            'ts': self.formatTime(record),
            'level': record.levelname,
            'logger': record.name,
            'msg': record.getMessage(),
            'module': record.module,
        })

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JSONFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
```

### 9.3 Metrics & Alerts

| Signal | Tool | What |
|--------|------|------|
| Pod metrics | CloudMonitor | CPU, memory, network per pod |
| Agent traces | OpenTelemetry + Jaeger | Run lifecycle, tool calls, approvals |
| Logs | SLS + Grafana | Container logs, K8s audit |
| Alerts | SLS / CloudMonitor | Failure rate >5%, cost spikes, token expiry |

---

## 10. Security

| Layer | Control |
|-------|---------|
| API | `x-ai-backend-secret` header validation (existing) |
| Agent | `AiPolicy.prohibited_actions` (workspace-configurable) |
| Agent | `AiPolicy.always_requires_approval` (protected actions) |
| MCP | Workspace-scoped: all tool calls include `workspace_id` |
| Network | Private subnets for worker nodes; ALB is only public entry |
| OAuth | Google tokens encrypted at rest via Better Auth |
| Secrets | K8s Secrets for DB URI, API keys; RAM for cloud credentials |
| Audit | Every tool call recorded in `ai_tool_calls` table |
| Guardrails | `scope_guardrail` (input) + `compliance_guardrail` (output) |
| WAF | Optional OWASP protection (~$50-200/mo in pay-as-you-go mode) |

### 10.1 RAM Least-Privilege

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cs:DescribeClusters",
        "cs:DescribeClusterDetail",
        "cs:DescribeClusterUserKubeconfig"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cr:PushRepository",
        "cr:PullRepository"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 11. Cost Breakdown

All pricing for **Singapore (ap-southeast-1)**, pay-as-you-go unless noted.

| Service | Configuration | Monthly |
|---------|--------------|--------:|
| **ACK Basic** | Free control plane | $0 |
| **ECS nodes** | 2x ecs.g7a.xlarge (4vCPU/8GB) | ~$260 |
| **ALB** | Standard, ~2 LCUs | ~$45 |
| **NAT Gateway** | Single-AZ, low traffic | ~$25 |
| **EIP** | 1 EIP, pay-by-traffic | ~$8 |
| **Redis** | In-cluster (free) or managed 1GB | $0 or ~$40 |
| **SLS (logs)** | ~5GB/day, 30-day retention | ~$33 |
| **ACR** | Personal Edition (free) | $0 |
| **DNS + SSL** | Free DigiCert DV | $0 |
| **Neon Postgres** | Existing (already paid) | $0 |
| **Model Studio API** | Qwen3.7-Max + Flash | ~$108 |
| **Subtotal (infra)** | | **~$371-411** |
| **Grand Total** | Infra + API | **~$479-519** |

**Cost optimization options:**
- 1-year ECS subscription: ~$140-180/month for nodes (saves ~$80-120/mo)
- Preemptible instances for workers: up to 80% discount
- ACS Agent Sandbox with hibernation: pay only when agents are active
- Model Studio context caching: 50% off repeated input tokens

---

## 12. Deployment Runbook

### Step 1: Create Alibaba Cloud Account
- Use international site (alibabacloud.com)
- Complete real-name verification
- Add credit card billing
- Set budget alert for $100 threshold

### Step 2: Choose Region
- **Singapore (ap-southeast-1)** — recommended for global balance
- Frankfurt (eu-central-1) for EU/GDPR compliance
- Virginia (us-east-1) for US-based users

### Step 3: Create VPC
```powershell
aliyun vpc CreateVpc --VpcName "saleseasyai-vpc" --CidrBlock "10.0.0.0/16"
```
Create 4 VSwitches (2 public, 2 private) across 2 availability zones.

### Step 4: Provision Services
1. **NAT Gateway** — single-AZ, in public subnet A
2. **EIP** — associate with NAT Gateway
3. **Neon Postgres** — already configured (no migration needed)
4. **ACR namespace** — `saleseasyai` (Personal Edition)
5. **Free DigiCert SSL** — via CAS console

### Step 5: Create ACK Basic Cluster
```powershell
aliyun cs CreateCluster --cluster_type "managed_kubernetes" --name "saleseasyai-prod" --region_id "ap-southeast-1" --vpcid "<vpc-id>" --num_of_nodes 2 --instance_types "ecs.g7a.xlarge" --snat_entry true --endpoint_public_access true --deletion_protection true
```
Install ALB Ingress Controller add-on after cluster is ready.

### Step 6: Configure kubectl
```powershell
aliyun cs DescribeClusterUserKubeconfig --ClusterId "<cluster-id>" > kubeconfig
$env:KUBECONFIG = "$pwd\kubeconfig"
kubectl create namespace proventu-ai
```

### Step 7: Deploy Infrastructure (Redis, Configs)
```powershell
kubectl apply -f k8s/redis-statefulset.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
```

### Step 8: Deploy Application
```powershell
# Build and push images
docker build -t registry.ap-southeast-1.aliyuncs.com/saleseasyai/backend:latest -f backend-ai/Dockerfile backend-ai/
docker push registry.ap-southeast-1.aliyuncs.com/saleseasyai/backend:latest

# Deploy to ACK
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/services.yaml
```

### Step 9: Configure Ingress
```powershell
kubectl apply -f k8s/alb-config.yaml
kubectl apply -f k8s/ingress.yaml
```
Verify ALB is provisioned and has an IP address.

### Step 10: Configure DNS
- Point `app.yourdomain.com` CNAME to ALB DNS name
- Wait for DNS propagation
- Verify HTTPS is working

### Step 11: Verify Health
```powershell
# Check all pods are running
kubectl get pods -n proventu-ai

# Check ingress status
kubectl get ingress -n proventu-ai

# Test endpoints
curl https://app.yourdomain.com/
curl https://app.yourdomain.com/api/health
```

### Step 12: Set Up CI/CD
1. Create RAM user with minimal permissions
2. Generate AccessKey pair
3. Add secrets to GitHub
4. Push to `main` branch and verify deployment

---

## 13. Kubernetes Manifests

All manifests go in `k8s/` directory at project root.

### 13.1 Namespace

Path: `k8s/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: proventu-ai
```

### 13.2 Frontend Deployment

Path: `k8s/frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: proventu-ai
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: registry.ap-southeast-1.aliyuncs.com/saleseasyai/frontend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
  namespace: proventu-ai
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
```

### 13.3 Backend Deployment

Path: `k8s/backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: proventu-ai
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: registry.ap-southeast-1.aliyuncs.com/saleseasyai/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 15
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: proventu-ai
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
```

### 13.4 Worker Deployment

Path: `k8s/worker-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  namespace: proventu-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: worker
  template:
    metadata:
      labels:
        app: worker
    spec:
      containers:
      - name: worker
        image: registry.ap-southeast-1.aliyuncs.com/saleseasyai/backend:latest
        command: ["python", "-m", "app.workers.run", "--concurrency", "2"]
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            cpu: 300m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

### 13.5 Horizontal Pod Autoscalers

Path: `k8s/hpa.yaml`

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: proventu-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 6
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: proventu-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 6
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

### 13.6 Pod Disruption Budgets

Path: `k8s/pdb.yaml`

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: backend-pdb
  namespace: proventu-ai
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: backend
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: frontend-pdb
  namespace: proventu-ai
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: frontend
```

### 13.7 ConfigMap

Path: `k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: proventu-ai
data:
  NODE_ENV: production
  NEXT_PUBLIC_BETTER_AUTH_URL: "https://app.yourdomain.com"
  AI_BACKEND_URL: "http://backend-svc:8000"
  QWEN_ORCHESTRATOR_MODEL: "qwen3.7-max"
  QWEN_SUBAGENT_MODEL: "qwen3.5-flash"
  REDIS_URL: "redis://redis-svc:6379/0"
  DISABLE_TRACING: "true"
  NEXT_TELEMETRY_DISABLED: "1"
```

### 13.8 Secrets Template

Path: `k8s/secrets.yaml` (DO NOT commit actual values)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: proventu-ai
type: Opaque
data:
  DATABASE_URI: <base64>
  DATABASE_DIRECT_URI: <base64>
  BETTER_AUTH_SECRET: <base64>
  AI_BACKEND_SHARED_SECRET: <base64>
  QWEN_API_KEY: <base64>
  GOOGLE_CLIENT_ID: <base64>
  GOOGLE_CLIENT_SECRET: <base64>
  STRIPE_SECRET_KEY: <base64>
  STRIPE_WEBHOOK_SECRET: <base64>
  LINKEDIN_CLIENT_ID: <base64>
  FACEBOOK_CLIENT_ID: <base64>
```

## 14. Production Checklist

- [ ] Alibaba Cloud account created and verified
- [ ] Billing configured with budget alerts
- [ ] VPC with public/private subnets across 2 AZs
- [ ] ACK Basic cluster running (2 nodes, auto-scaling)
- [ ] ALB Ingress Controller installed
- [ ] ACR Personal Edition with `saleseasyai` namespace
- [ ] Docker images built and pushed
- [ ] K8s manifests applied (namespace, deployments, services, ingress)
- [ ] Redis StatefulSet running
- [ ] Neon Postgres accessible (pgvector enabled)
- [ ] SSL certificate issued and deployed to ALB
- [ ] DNS configured (CNAME to ALB)
- [ ] HTTPS verified (certificate valid, no mixed content)
- [ ] SLS log collection enabled
- [ ] GitHub Actions secrets configured
- [ ] CI/CD pipeline deployed successfully
- [ ] Health checks passing (frontend, backend, workers)
- [ ] Agent workflow test: schedule meeting, send email
- [ ] Cost monitoring dashboard set up