# Pharmapilote App

Application frontend built with Vite and delivered as a static bundle. See DEPLOYMENT.md for build and deployment instructions.

## Security note (important)

This project may use build-time variables prefixed with `VITE_` (for example `VITE_GOOGLE_GENAI_KEY`). Variables prefixed with `VITE_` are injected into the client bundle at build time and therefore become publicly visible in the compiled frontend. Do NOT store any secret that must remain private in a `VITE_` variable.

If you need to keep a key secret (production API keys, private tokens, etc.), run the GenAI calls from a backend or proxy that holds the secret server-side, and have the frontend call that backend. See DEPLOYMENT.md for details and recommended build patterns.

### Keep your .env out of the repository

Make sure your local `.env` file is listed in `.gitignore` and never committed. Example entry to add to `.gitignore`:

```
.env
```

If your deployment uses CI, configure secrets there rather than committing keys to source control.

### Note en français (important)

Ce projet peut utiliser des variables de build préfixées par `VITE_` (par exemple `VITE_GOOGLE_GENAI_KEY`). Les variables `VITE_` sont injectées dans le bundle client lors de la compilation et sont donc visibles publiquement dans le frontend compilé. NE stockez PAS de secrets privés (clés API de production, tokens sensibles, etc.) dans une variable `VITE_`.

Si une clé doit rester secrète, effectuez les appels GenAI depuis un backend / proxy qui conserve la clé côté serveur, et faites en sorte que le frontend appelle ce backend. Voir DEPLOYMENT.md pour les exemples et bonnes pratiques.
