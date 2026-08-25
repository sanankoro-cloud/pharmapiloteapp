# Deployment notes

This document explains how to pass the VITE_GOOGLE_GENAI_KEY build-arg to Docker when building the frontend, how to run locally with docker-compose, and security notes about VITE_ variables.

## Why this exists

The project builds the frontend (Vite) inside a Docker `builder` stage. Vite injects variables prefixed with `VITE_` into the client bundle during the build process. If your frontend code uses `import.meta.env.VITE_GOOGLE_GENAI_KEY` (or similar), that value must be present at build time to be embedded into the static bundle.

## How to provide the key during build

1) Using docker build directly:

```bash
docker build --build-arg VITE_GOOGLE_GENAI_KEY="your_key_here" -t pharmapilote:latest .
```

2) Using docker-compose (recommended for local development):

- Add `VITE_GOOGLE_GENAI_KEY` to your local `.env` file (do NOT commit it):

  ```bash
  cp .env.example .env
  # edit .env and add:
  VITE_GOOGLE_GENAI_KEY="your_key_here"
  ```

- Then run:

  ```bash
  docker-compose up -d --build
  docker-compose logs -f pharmapilote
  ```

The docker-compose.yml build configuration passes the build arg into the builder stage, and the safer Dockerfile variant uses the ARG directly for the `npm run build` command to avoid persisting the value in image ENV layers.

## Security notes

- Variables prefixed with `VITE_` are embedded into the client bundle at build time and are visible to anyone who can load the frontend. Do NOT use `VITE_` variables to store any secret you must keep private (API secrets, private keys, or production-only tokens).

- If the key must remain secret, prefer implementing a backend/proxy that holds the secret server-side. The frontend should call your backend, and the backend should call Google GenAI.

- Using the Dockerfile pattern `RUN VITE_GOOGLE_GENAI_KEY="$VITE_GOOGLE_GENAI_KEY" npm run build` reduces the chance that the secret is left as an `ENV` in an image layer, but it does not change the fact that the value will be included in the produced bundle if the code references it.

## Cleanup after local builds

If you built locally with a real key and want to remove any cached build layers that might contain the value:

```bash
# Remove dangling images
docker image prune -f
# Remove builder cache
docker builder prune -f
```

## Example: verify the bundle

After building, you can search the `dist` folder for the token (only recommended with test keys):

```bash
grep -R "VITE_GOOGLE_GENAI_KEY" dist || echo "No explicit reference found"
```

## Recommended next steps

- Keep `.env` with the VITE key out of the repo and out of CI logs.
- If you need a private key in production, implement a small backend service that performs the GenAI calls.
