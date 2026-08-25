# Pharmapilote App

Application frontend built with Vite and delivered as a static bundle. See DEPLOYMENT.md for build and deployment instructions.

## Security note (important)

This project may use build-time variables prefixed with `VITE_` (for example `VITE_GOOGLE_GENAI_KEY`). Variables prefixed with `VITE_` are injected into the client bundle at build time and therefore become publicly visible in the compiled frontend. Do NOT store any secret that must remain private in a `VITE_` variable.

If you need to keep a key secret (production API keys, private tokens, etc.), run the GenAI calls from a backend or proxy that holds the secret server-side, and have the frontend call that backend. See DEPLOYMENT.md for details and recommended build patterns.

