# Round-robin

This demo provides a minimal Express API with role-based authentication and a simple Next.js frontend.

## Running the API

Install dependencies and start the server:

```bash
npm install
node round_robin_server.js
```

The API listens on `http://localhost:4000`.

## Running the Frontend

The frontend is a small Next.js project located in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

By default the frontend runs on `http://localhost:3000` and expects the API to be running on port 4000.
