## Monorepo contains two TypeScript-based microservices:

- `user-service`: Handles user management (CRUD, auth, roles)
- `noti-service`: Sends notifications via email, LINE, or other channels 

Built with Fastify, Prisma, PostgreSQL, and Docker Compose.

---

## 📁 Project Structure

```
services/
├── user-service/
│ ├── src/
│ └── prisma/
├── noti-service/
│ ├── src/
│ └── prisma/
└── docker-compose.yml
```

---


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
cp services/noti-service/.env.example services/noti-service/.env
```

## Migrate DB
From inside a service folder:
``` bash 
npx prisma migrate dev
```
