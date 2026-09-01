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
- `POST` / `GET /profile` to save or retrieve body measurements and activity level
- `POST /profile/medical-record` for a user to enter their own medical-record summary
- `POST` / `DELETE /profile/medical-conditions` to manage self-reported conditions
- `POST` / `GET /profile/goal` to save or retrieve a desired weight or BMI
- `GET /calorie-target` for an explainable, safety-bounded daily calorie estimate
- `GET /nutrient-flags` for conservative nutrition considerations tied to conditions the user entered

Run the initial API checks with `npm test`.

Medical information is never pre-populated. Users enter it themselves; this demo does not diagnose conditions or interpret a record as medical advice.
