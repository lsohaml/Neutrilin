# NutriGuide frontend

This frontend is wired to the Neutrilin Express API at `http://localhost:4000` by default.

## Run locally

1. Start the Neutrilin API in the parent folder:

```powershell
cd ..
npm install
npm run prisma:generate
npm run dev
```

2. In a second terminal, start this frontend:

```powershell
cd NutriGuide
npm install
npm run dev
```

3. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend stores the JWT returned by `/auth/login` or `/auth/signup` in local storage and sends it as a Bearer token to protected API routes.

For a different API host, create `.env` from `.env.example` and set `VITE_API_BASE_URL`.

## Implemented API-connected features

- Sign up / sign in
- Dashboard with today's live calorie summary and meal entries
- Manual food logging
- Profile save/retrieve
- Goal save/retrieve
- Progress weight logging and history
- AI suggestions page using `/suggestions`
- Nutrient flags page using `/nutrient-flags`

The API's own restrictions still apply. In particular, personalized calorie targets require the profile fields accepted by the backend, and AI suggestions require `GEMINI_API_KEY` on the server.
