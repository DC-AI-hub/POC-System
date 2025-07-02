# Database Schema and Deployment Guide

## Table of Contents
1. [Database Schema](#database-schema)
2. [Environment Setup](#environment-setup)
3. [Deployment Guide](#deployment-guide)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Database Schema

### Entity Relationship Overview

The system uses PostgreSQL with the following main entities:

### 1. User Management Tables

#### users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    department_id BIGINT REFERENCES departments(id),
    position_id BIGINT REFERENCES positions(id),
    manager_id BIGINT REFERENCES users(id),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);
```

#### roles
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_built_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_roles
```sql
CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id),
    role_id BIGINT REFERENCES roles(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);
```

### 2. Organization Tables

#### departments
```sql
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES departments(id),
    manager_id BIGINT REFERENCES users(id),
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### positions
```sql
CREATE TABLE positions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    level INTEGER DEFAULT 1,
    is_manager BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Workflow Tables

#### workflow_templates
```sql
CREATE TABLE workflow_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    nodes JSONB NOT NULL,
    edges JSONB NOT NULL,
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);
```

#### workflow_instances
```sql
CREATE TABLE workflow_instances (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES workflow_templates(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    current_node VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);
```

### 4. Expense Management Tables

#### expense_categories
```sql
CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES expense_categories(id),
    level INTEGER DEFAULT 1,
    budget_limit DECIMAL(15,2),
    approval_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### expense_applications
```sql
CREATE TABLE expense_applications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    applicant_id BIGINT REFERENCES users(id),
    category_id BIGINT REFERENCES expense_categories(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4),
    business_purpose TEXT,
    expense_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    workflow_instance_id BIGINT REFERENCES workflow_instances(id),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Integration Tables

#### integration_configs
```sql
CREATE TABLE integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    auth_type VARCHAR(50) NOT NULL,
    credentials JSONB NOT NULL,
    field_mappings JSONB NOT NULL,
    sync_schedule JSONB,
    retry_policy JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);
```

#### sync_results
```sql
CREATE TABLE sync_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES integration_configs(id),
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    records_processed INTEGER DEFAULT 0,
    records_succeeded INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    errors JSONB,
    summary JSONB,
    metadata JSONB
);
```

### 6. Audit and Logging Tables

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id BIGINT REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### system_logs
```sql
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    module VARCHAR(50),
    exception_trace TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Environment Setup

### Prerequisites

1. **Java Development Kit 8+**
2. **Node.js 18+**
3. **PostgreSQL 12+**
4. **Docker & Docker Compose**
5. **Maven 3.6+**
6. **pnpm package manager**

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd poc-system
```

#### 2. Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose -f docker-compose.db.yml up -d

# Create database
createdb -h localhost -p 5432 -U postgres poc_system

# Run database migrations
cd backed/backed
mvn flyway:migrate
```

#### 3. Backend Setup
```bash
cd backed/backed

# Install dependencies
mvn clean install

# Set environment variables
export DATABASE_URL=jdbc:postgresql://localhost:5432/poc_system
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret

# Start backend server
mvn spring-boot:run
```

#### 4. Frontend Setup
```bash
cd fronted

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev
```

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/poc_system
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=86400

# OAuth2
OAUTH2_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH2_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Integration
LDAP_URL=ldap://your-ldap-server:389
LDAP_BASE_DN=dc=company,dc=com
LDAP_USERNAME=admin
LDAP_PASSWORD=admin_password

# File Storage
FILE_UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10MB
```

#### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth2
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Features
NEXT_PUBLIC_ENABLE_OAUTH2=true
NEXT_PUBLIC_ENABLE_LDAP=true
NEXT_PUBLIC_ENABLE_INTEGRATIONS=true
```

---

## Deployment Guide

### Production Deployment with Docker

#### 1. Build Images
```bash
# Build backend image
cd backed
docker build -t poc-system-backend .

# Build frontend image
cd fronted
docker build -t poc-system-frontend .
```

#### 2. Deploy with Docker Compose
```bash
# Production deployment
docker-compose up -d

# With custom configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### 3. Database Migration
```bash
# Run migrations in production
docker exec -it poc-system-backend mvn flyway:migrate
```

### Kubernetes Deployment

#### 1. Create Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: poc-system
```

#### 2. Database Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: poc-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:13
        env:
        - name: POSTGRES_DB
          value: "poc_system"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

#### 3. Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: poc-system
spec:
  replicas: 3
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
        image: poc-system-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          value: "jdbc:postgresql://postgres:5432/poc_system"
        - name: DATABASE_USERNAME
          value: "postgres"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 4. Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: poc-system
spec:
  replicas: 2
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
        image: poc-system-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://backend:8080"
        - name: NEXTAUTH_URL
          value: "https://your-domain.com"
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: Deploy POC System

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '8'
          distribution: 'temurin'
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Test Backend
        run: |
          cd backed/backed
          mvn test
      
      - name: Test Frontend
        run: |
          cd fronted
          npm ci
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Deploy
        run: |
          docker build -t poc-system-backend backed/
          docker build -t poc-system-frontend fronted/
          # Deploy to your infrastructure
```

---

## Configuration

### Application Configuration

#### Backend (application.yml)
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: ${JWT_EXPIRATION:86400}
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

logging:
  level:
    demo.backed: INFO
    org.springframework.security: DEBUG
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
```

#### Frontend (next.config.mjs)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Nginx Configuration

```nginx
upstream backend {
    server backend1:8080;
    server backend2:8080;
    server backend3:8080;
}

upstream frontend {
    server frontend1:3000;
    server frontend2:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin https://your-domain.com;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
}
```

---

## Monitoring

### Health Checks

#### Backend Health Endpoint
- **URL**: `GET /api/health`
- **Response**:
```json
{
  "status": "UP",
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "connectionPool": {
          "active": 5,
          "idle": 10,
          "max": 20
        }
      }
    },
    "integrations": {
      "status": "UP",
      "details": {
        "ldap": "UP",
        "oauth2": "UP"
      }
    }
  }
}
```

#### Frontend Health Check
- **URL**: `GET /api/health`
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "backend": "healthy",
    "database": "healthy"
  }
}
```

### Prometheus Metrics

#### Backend Metrics (Spring Boot Actuator)
```yaml
# Available at /actuator/prometheus
# Metrics include:
- jvm_memory_used_bytes
- http_requests_total
- database_connections_active
- custom_business_metrics
```

#### Custom Business Metrics
```java
@Component
public class BusinessMetrics {
    private final Counter expenseApplicationsCreated;
    private final Gauge activeWorkflows;
    
    public BusinessMetrics(MeterRegistry meterRegistry) {
        this.expenseApplicationsCreated = Counter.builder("expense_applications_created_total")
            .description("Total number of expense applications created")
            .register(meterRegistry);
            
        this.activeWorkflows = Gauge.builder("active_workflows")
            .description("Number of active workflow instances")
            .register(meterRegistry);
    }
}
```

### Logging Configuration

#### Structured Logging (Logback)
```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
            <providers>
                <timestamp/>
                <version/>
                <logLevel/>
                <message/>
                <mdc/>
                <arguments/>
                <stackTrace/>
            </providers>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/application.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
docker exec -it postgres psql -U postgres -d poc_system -c "SELECT 1;"

# Check connection pool
curl http://localhost:8080/actuator/health

# Reset connection pool
docker restart poc-system-backend
```

#### 2. Authentication Problems
```bash
# Verify JWT token
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/users/me

# Check OAuth2 configuration
curl http://localhost:3000/api/auth/providers

# Clear auth cookies
# Use browser dev tools or:
curl -X POST http://localhost:3000/api/auth/signout
```

#### 3. Integration Sync Failures
```bash
# Check integration status
curl http://localhost:3000/api/integrations

# Test connection
curl -X POST http://localhost:3000/api/integrations/test -d '{"id":"config-id"}'

# View sync logs
curl http://localhost:8080/api/logs/audit?module=integration
```

#### 4. Performance Issues
```bash
# Check system metrics
curl http://localhost:8080/actuator/metrics

# Database performance
docker exec -it postgres psql -U postgres -d poc_system -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;"

# Memory usage
docker stats poc-system-backend poc-system-frontend
```

### Log Analysis

#### Backend Logs
```bash
# View application logs
docker logs -f poc-system-backend

# Search for specific errors
docker logs poc-system-backend 2>&1 | grep -i "error\|exception"

# Filter by level
docker logs poc-system-backend 2>&1 | grep "ERROR"
```

#### Frontend Logs
```bash
# View Next.js logs
docker logs -f poc-system-frontend

# Check build logs
docker exec -it poc-system-frontend cat .next/build.log
```

### Performance Tuning

#### JVM Tuning
```bash
# Heap size optimization
-Xms2g -Xmx4g

# Garbage collection
-XX:+UseG1GC -XX:MaxGCPauseMillis=200

# JIT compilation
-XX:+TieredCompilation -XX:TieredStopAtLevel=1
```

#### Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_expense_applications_status ON expense_applications(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Update table statistics
ANALYZE;

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM expense_applications WHERE status = 'pending';
```

---

This comprehensive guide covers all aspects of database schema, deployment, and system configuration. For specific deployment scenarios or troubleshooting, refer to the relevant sections and adapt the configurations to your environment.