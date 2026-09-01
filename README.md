# Neutrilin

Demo health-assistant API. It stores account and health-profile data, so it is deliberately marked **demo only** until production security, privacy, encryption, consent, retention, and applicable regulatory requirements are designed and reviewed.

## Prompt 1 setup

1. Copy `.env.example` to `.env` and replace the placeholder values.
2. Create a PostgreSQL database, then run `npm run prisma:migrate -- --name init`.
3. Run `npm run prisma:generate` and `npm run dev`.

Available endpoints:

- `GET /health`
- `POST /auth/signup` with `email` and `password`
- `POST /auth/login` with `email` and `password`
- `GET /health/me` with `Authorization: Bearer <token>`

Run the initial API checks with `npm test`.
