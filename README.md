## Monorepo contains three TypeScript-based microservices:

- `user-service`: Handles user CRUD, emits domain events via Outbox pattern.
- `outbox-service`: Polls outbox DB table and produces events to Kafka.
- `noti-service`: Sends notifications via email, LINE, or other channels 

## 🛠 Built with:

- Fastify (web server)
- Prisma (ORM)
- PostgreSQL
- Kafka (via KafkaJS)
- OpenTelemetry + OTLP + Grafana Tempo (tracing)
- Prometheus + Grafana (metrics)
- Docker Compose (multi-service local dev)


## 📁 Project Structure

```
services/
├── user-service/
│   ├── src/
│   └── prisma/
├── outbox-service/
│   ├── src/
│   └── prisma/
├── notification-service/
│   ├── src/
│   └── prisma/
└── docker-compose.yml
```

## ⚙️ Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional) `pnpm` or `npm` for local development

---

## 🐳 Running All Services with Docker Compose

This project is fully containerized.

### 🚀 Start All Services

```bash
docker-compose up --d
```

## 🔧 Environment Setup
Each service uses its own .env file. Start by copying the examples:

``` bash
cp services/user-service/.env.example services/user-service/.env 
```

``` bash
cp services/outbox-service/.env.example services/outbox-service/.env
```

``` bash
cp services/notification-service/.env.example services/notification-service/.env
```

## Migrate DB
From inside a service folder:
``` bash 
npx prisma migrate dev
```
Or for example:
``` bash 
cd services/user-service
npx prisma migrate dev
```

---

## 📊 Observability
Distributed Tracing:
- Exported via OpenTelemetry OTLP HTTP
- Collected by Grafana Tempo

Metrics:
- Exposed via Prometheus
- Dashboards available in Grafana

Visit Grafana UI at: http://localhost:3000
(Default: admin / admin)


## 📬 Event-Driven Communication
- user-service inserts Outbox event in DB
- outbox-service polls DB → sends Kafka event
- notification-service consumes from Kafka → processes it

All trace context is preserved across services (via Kafka propagation) and visible in Grafana Tempo.
