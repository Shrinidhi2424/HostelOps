# HostelOps — Deployment Documentation

**Containerized Complaint Management System on AWS EC2**

- **Stack:** React · Express.js · PostgreSQL · Nginx · Docker Compose
- **CI/CD:** GitHub Actions → Amazon ECR → EC2
- **Date:** February 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Docker Implementation](#3-docker-implementation)
4. [Reverse Proxy (Nginx)](#4-reverse-proxy-nginx)
5. [Networking & Firewall](#5-networking--firewall)
6. [Environment Variables](#6-environment-variables)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Request Lifecycle](#8-request-lifecycle)
9. [Production Readiness](#9-production-readiness)
10. [Serverful vs Serverless](#10-serverful-vs-serverless)

---

## 1. Project Overview

HostelOps digitizes hostel complaint management. Students submit and track maintenance complaints; administrators triage, filter, and resolve them through a centralized dashboard.

### Functional Scope

| Module | Capabilities |
|---|---|
| **Student** | Register, login (JWT), submit complaints (category + priority), view status, delete pending complaints |
| **Admin** | Dashboard with stats, filter by category/status/priority, update complaint status |

### Why Containerized + Reverse Proxy

- **Containers** guarantee identical behavior across dev/staging/production, isolate services, and simplify deployment to a single `docker compose up -d` command.
- **Reverse proxy** provides a single public entry point (port 80), serves static files efficiently via Nginx, proxies API traffic internally, and keeps backend/database ports unexposed.

---

## 2. System Architecture

### Request Flow

```
Developer → GitHub → GitHub Actions → ECR (Image Registry)
                                            ↓
User (Browser) → EC2 Security Group → Nginx Container (port 80)
                                            ↓
                   Static Files ← Nginx → /api/* → Backend Container (port 5000)
                                                          ↓
                                                  PostgreSQL Container (port 5432)
                                                          ↓
                                                  Persistent Volume (pgdata)
```

### Container Summary

| Container | Image | Role | Port Exposure |
|---|---|---|---|
| `hostelops-frontend` | Multi-stage Nginx | Static files + reverse proxy | `80:80` (host-mapped) |
| `hostelops-backend` | Node.js 18 Alpine | Express REST API | `5000` (internal only) |
| `hostelops-db` | postgres:15-alpine | PostgreSQL database | Internal only |

All three containers share a custom Docker bridge network (`appnet`). Docker DNS resolves service names: Nginx reaches the backend via `http://backend:5000`, the backend reaches the database via `db:5432`.

Only the Nginx container binds to the host. Backend and database ports are unreachable from outside the Docker network.

---

## 3. Docker Implementation

### 3.1 Docker Compose

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: hostelops-db
    environment:
      POSTGRES_USER: hostel
      POSTGRES_PASSWORD: hostelpass
      POSTGRES_DB: hostelops
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - appnet
    restart: unless-stopped

  backend:
    image: 378591035436.dkr.ecr.ap-south-1.amazonaws.com/namespace/hostelops-backend:latest
    container_name: hostelops-backend
    env_file:
      - ./backend/.env.docker
    expose:
      - "5000"
    depends_on:
      - db
    networks:
      - appnet
    restart: unless-stopped

  frontend:
    image: 378591035436.dkr.ecr.ap-south-1.amazonaws.com/namespace/hostelops-frontend:latest
    container_name: hostelops-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - appnet
    restart: unless-stopped

networks:
  appnet:
    driver: bridge

volumes:
  pgdata:
```

**Key decisions:**

- **ECR Images:** Both `backend` and `frontend` services pull pre-built images from Amazon ECR (`378591035436.dkr.ecr.ap-south-1.amazonaws.com/namespace/hostelops-backend:latest` and `hostelops-frontend:latest` respectively). This means images are built by CI/CD and stored in ECR, not built locally on the EC2 instance.
- **`env_file`:** The `backend` service loads environment variables from `./backend/.env.docker` via `env_file`.
- **`expose` vs `ports`:** The backend uses `expose: "5000"`, making the port visible only to other containers on `appnet`. The frontend uses `ports: "80:80"`, mapping to the host. This ensures the API is only reachable through Nginx.
- **Named volume `pgdata`:** Persists database data across container restarts. Survives `docker compose down`; only destroyed with `docker compose down -v`.
- **`restart: unless-stopped`:** Containers auto-restart on crash or EC2 reboot. Only an explicit `docker stop` prevents restart.
- **`depends_on`:** Enforces startup order: db → backend → frontend.
- **Custom bridge network:** Enables DNS resolution by service name. The default bridge network does not support this.

### 3.2 Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]
```

- **Alpine base** reduces image size (~50MB vs ~350MB Debian).
- **`npm ci --production`** installs exact versions from lockfile, excludes devDependencies.
- **Layer ordering:** `package*.json` is copied before source code so the dependency layer is cached when only source changes.
- **Exec form `CMD`** ensures Node.js receives OS signals for graceful shutdown.

### 3.3 Frontend Dockerfile (Multi-Stage)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Stage 1** installs all dependencies (including Vite) and produces the production bundle in `/app/dist/`.

**Stage 2** starts from a clean `nginx:alpine` (~25MB) and copies only the built static files. The final image contains no Node.js, no npm, no source code, and no `node_modules`.

| Factor | Single Stage | Multi-Stage |
|---|---|---|
| Image Size | ~400MB+ | ~30MB |
| Attack Surface | Full Node.js runtime | Nginx + static files only |
| Serving | Node.js (single-threaded) | Nginx (event-driven) |

---

## 4. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://backend:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Routing Logic

| Request Path | Handling |
|---|---|
| `/` , `/dashboard`, `/admin` | `try_files` looks for a matching file; falls back to `index.html` for React Router client-side routing |
| `/assets/index-*.js` | Served directly as a static file |
| `/api/*` | Proxied to `http://backend:5000` (Docker DNS resolves `backend` to container IP) |
| `/health` | Proxied to `http://backend:5000/health` — returns `{"status":"ok"}` |

### Proxy Headers

- `Host $host` — preserves the original request hostname
- `X-Real-IP` — forwards the client's real IP (backend otherwise sees Nginx's IP)
- `X-Forwarded-For` — client IP chain for multi-proxy setups
- `X-Forwarded-Proto` — indicates HTTP vs HTTPS origin

Nginx is the sole public-facing service. It serves static files without involving Node.js and reverse-proxies API calls internally. Future TLS termination would be handled here.

---

## 5. Networking & Firewall

### EC2 Security Group

| Port | Protocol | Source | Purpose |
|---|---|---|---|
| 22 | TCP | Restricted IP | SSH access for administrators |
| 80 | TCP | `0.0.0.0/0` | Public HTTP access (Nginx) |

Ports 5000 (backend) and 5432 (database) are **not** opened. These services are internal to the Docker network and unreachable from the internet.

### Docker Network Isolation

All containers connect to the `appnet` bridge network. Communication happens via Docker's internal DNS:

- Nginx → `http://backend:5000`
- Backend → `postgres://hostel:hostelpass@db:5432/hostelops`

This traffic stays within Docker's virtual network and never traverses the host's public interface.

```
Internet → Security Group (port 80 only)
                    ↓
          ┌─── Docker Network (appnet) ───┐
          │  Nginx ──→ Backend ──→ Postgres│
          │ (80:80)    (5000)      (5432)  │
          └────────────────────────────────┘
```

This follows the principle of least privilege: only the minimum required port (80) is publicly exposed.

---

## 6. Environment Variables

### Local Development (`backend/.env`)

```
PORT=5000
DATABASE_URL=postgres://postgres:<password>@localhost:5432/hostelops
JWT_SECRET=h0st3L0pS_s3cr3t_k3y_x9q2p4v8m5j1
```

### Docker Deployment (`backend/.env.docker`)

```
PORT=5000
DATABASE_URL=postgres://hostel:hostelpass@db:5432/hostelops
JWT_SECRET=h0st3L0pS_s3cr3t_k3y_x9q2p4v8m5j1
```

The key difference is the **host**: `localhost` locally vs `db` (Docker service name) in containers. Credentials match the `POSTGRES_USER` and `POSTGRES_PASSWORD` defined in `docker-compose.yml`.

**Why externalized:**
- `.env` files are excluded from Git (`.gitignore`) and Docker images (`.dockerignore`), preventing credential leaks.
- `env_file` in Docker Compose loads variables at container startup, not build time.
- Separate files allow different configs per environment without changing code.

---

## 7. CI/CD Pipeline

### Workflow (`.github/workflows/deploy.yml`)

```yaml
name: CI-CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to ECR
        run: |
          aws ecr get-login-password --region ${{ secrets.AWS_REGION }} \
          | docker login --username AWS --password-stdin \
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com

      - name: Build Backend
        run: |
          docker build -t hostelops-backend ./backend
          docker tag hostelops-backend:latest \
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/namespace/hostelops-backend:latest

      - name: Push Backend
        run: |
          docker push \
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/namespace/hostelops-backend:latest

      - name: Build Frontend
        run: |
          docker build -t hostelops-frontend ./frontend
          docker tag hostelops-frontend:latest \
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/namespace/hostelops-frontend:latest

      - name: Push Frontend
        run: |
          docker push \
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/namespace/hostelops-frontend:latest

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd HostelOps
            docker compose pull
            docker compose up -d
```

### Pipeline Steps

| Step | Action |
|---|---|
| **Trigger** | Push to `main` branch |
| **Checkout** | Clone repository into the CI runner |
| **AWS Credentials** | Configure IAM access keys (stored as GitHub Secrets) for ECR access |
| **ECR Login** | `aws ecr get-login-password` generates a temp token; Docker authenticates with ECR |
| **Build Backend** | `docker build` from `./backend` Dockerfile |
| **Tag + Push Backend** | Tag with ECR URI and push to registry |
| **Build Frontend** | Multi-stage `docker build` from `./frontend` |
| **Tag + Push Frontend** | Tag with ECR URI and push to registry |
| **Deploy to EC2** | SSH via `appleboy/ssh-action` → `docker compose pull` + `docker compose up -d` |

### Pipeline Flow

```
Push to main → Build images → Push to ECR → SSH into EC2 → Pull images → Restart containers
```

### IAM & Secrets

| Secret | Purpose |
|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM credentials for GitHub Actions to access ECR |
| `AWS_REGION` / `AWS_ACCOUNT_ID` | ECR registry location |
| `EC2_HOST` | EC2 public IP |
| `EC2_SSH_KEY` | Private key for SSH access |

- **GitHub Actions** uses IAM access keys (needed because it runs outside AWS).
- **EC2** needs only ECR read (pull) permissions — it does not build or push images.
- No builds happen on EC2. Images are pre-built in CI and pulled as artifacts.

---

## 8. Request Lifecycle

Complete flow when a user accesses the application:

1. **Browser** sends HTTP request to EC2 public IP, port 80.
2. **Security Group** permits port 80 inbound traffic; drops all other ports.
3. **Nginx** receives the request inside the `hostelops-frontend` container.
   - Static file request (e.g., `/assets/index.js`) → served directly.
   - SPA route (e.g., `/dashboard`) → `try_files` falls through to `index.html` → React Router handles it client-side.
   - API request (e.g., `POST /api/auth/login`) → proxied to `http://backend:5000/api/auth/login`.
4. **Backend** processes the request through Express middleware → route handler → Sequelize ORM.
5. **PostgreSQL** executes the query via the `db:5432` internal connection.
6. **Response** flows back: PostgreSQL → Backend → Nginx → Browser.

All inter-container communication uses Docker DNS on the `appnet` bridge network. No internal traffic is exposed externally.

---

## 9. Production Readiness

### Crash Resilience

`restart: unless-stopped` on all services ensures:

- Crashed containers restart automatically.
- After EC2 reboot, Docker daemon starts and restarts all containers.
- Only explicit `docker stop` prevents restart.

### Reboot Recovery

On EC2 reboot: OS boots → Docker daemon starts → containers restart with existing volumes → application is live. No manual intervention required.

### Persistent Storage

The `pgdata` volume preserves database data across:
- Container restarts and recreation
- `docker compose down` (removes containers, keeps volumes)
- EC2 stop/start cycles (volume on EBS)

Only `docker compose down -v` destroys the volume.

### Stateless Frontend

The Nginx container holds no state — only pre-built static files from the image. It can be destroyed and recreated without data loss.

### Logging

```bash
docker compose logs -f           # Stream all logs
docker compose logs backend      # Backend only
docker compose logs --tail 100   # Last 100 lines
```

### Zero Rebuild on EC2

The CI/CD pipeline builds images in GitHub Actions and pushes to ECR. EC2 only pulls and restarts — no Node.js, npm, or build tools needed on the server.

---

## 10. Serverful vs Serverless

| Aspect | EC2 + Docker (Serverful) | Lambda / Fargate (Serverless) |
|---|---|---|
| **Infrastructure** | Developer manages EC2, Docker, networking | Provider manages everything |
| **Control** | Full OS/runtime/network control | Limited to code and config |
| **Scaling** | Manual or ASG-based | Automatic, scales to zero |
| **Cost** | Fixed (24/7 instance) | Pay per invocation |
| **Cold Starts** | None | 100ms–3s after idle |
| **Persistent Connections** | Supported (DB pools, WebSockets) | Limited (stateless, short-lived) |
| **Debugging** | SSH, container inspection, direct logs | CloudWatch, no direct access |

### Why Serverful Was Chosen

- Provides hands-on experience with containerization, Nginx configuration, CI/CD pipelines, and network security.
- Every layer (Docker network, reverse proxy, security group) is visible and configurable.
- PostgreSQL runs as a persistent container — simpler than managed serverless DB options.
- EC2 `t2.micro` (free tier) provides predictable cost for the project duration.

---

## Appendix A: Command Reference

| Command | Purpose |
|---|---|
| `docker compose up -d` | Start all containers (detached) |
| `docker compose down` | Stop and remove containers (keeps volumes) |
| `docker compose down -v` | Stop, remove containers, and delete volumes |
| `docker compose build` | Build images from Dockerfiles |
| `docker compose pull` | Pull latest images from registry |
| `docker compose logs -f` | Stream logs |
| `docker compose ps` | List running containers |
| `docker exec hostelops-backend node src/utils/seedAdmin.js` | Seed admin user |
| `docker exec -it hostelops-db psql -U hostel -d hostelops` | Open database shell |
| `curl http://localhost/health` | Verify backend health |

## Appendix B: File Structure

```
HostelOps/
├── .github/workflows/deploy.yml
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env / .env.docker
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/api.js
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── DEPLOYMENT_DOCUMENTATION.md
└── README.md
```

---

*All values in this document are sourced directly from repository configuration files.*
