# Agronegocios Coronado — Backend

API NestJS 11 para la gestión administrativa de AGRONEGOCIOS CORONADO S.A.C.

## Requisitos

- Node.js 20+
- Docker Desktop

## Arranque

```bash
docker compose up -d
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Usa un `.env` local (no se sube al repositorio) con `PORT`, `FRONTEND_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` y las variables `ADMIN_*` del seed.

Postgres del compose usa el puerto **5433** (el 5432 suele estar ocupado en Windows).

API en `http://localhost:3000/api`. Usuario seed:

- correo: `admin@agronegocioscoronado.com`
- clave: `Coronado2026!`

## Endpoints Sprint 1–2

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/settings`
- `GET|POST /api/users` · `PATCH /api/users/:id` · `PATCH /api/users/:id/password`
- `GET /api/roles`
- `GET|POST /api/partners` · `PATCH /api/partners/:id` · `PATCH /api/partners/:id/active`
