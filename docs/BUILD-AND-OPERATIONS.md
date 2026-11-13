# Build and Operations

## Package scripts

The current `package.json` defines:

| Script | Command | Meaning |
|---|---|---|
| `start` | `nodemon --exec ts-node-dev src/app` | Development-oriented server start with restart support |
| `dev` | `nodemon --exec ts-node-dev src/app` | Same command as `start` |
| `build` | `webpack --config webpack.config.js` | Bundles `src/app.ts` to `dist/app.js` |
| `prod` | `node dist/app` | Runs the built application (Node resolves the `.js` extension) |
| `test` | `echo "Error: no test specified" && exit 1` | Placeholder; there is no configured test runner |

Typical local commands after dependencies have been installed:

```bash
npm ci
npm run dev
```

For the bundled production path:

```bash
npm run build
npm run prod
```

The webpack configuration targets Node, uses `ts-loader`, resolves `.ts` and `.js`, ignores `pg-native`, and enables `webpack-bundle-analyzer`.

## TypeScript configuration

`tsconfig.json` currently enables:

- `strict: true`;
- target `es6`;
- module and module resolution `node16`;
- `esModuleInterop: true`;
- `skipLibCheck: true`;
- `forceConsistentCasingInFileNames: true`;
- decorator metadata options;
- source root `src/` and output directory `es6/`.

Webpack is the configured build entry point; do not assume the `tsconfig` output directory is the production artifact.

## Environment configuration

Base defaults and named environment overrides are defined in `src/config.ts`. The named configurations currently include `dev`, `sit`, and `prd`.

The checked-in `.env` file contains the keys `ENV` and `DB_CONNECTIONSTRING`; its values are intentionally not reproduced here. `src/app.ts` loads dotenv and merges configuration with `process.env` and `process.env.ENV` through `config-plus`.

Configuration includes:

- `port`;
- CORS/allow settings;
- log level and field mapping;
- middleware logging flags and field names;
- PostgreSQL connection settings.

Do not commit credentials or copy secrets into documentation. The current `sit` configuration in `src/config.ts` contains a literal PostgreSQL connection string with credentials. Treat that as a security issue to clean up: move credentials to environment variables or a secret manager and rotate any credential that has been exposed in a shared repository. Verify the exact environment-variable mapping with `config-plus` before changing deployment configuration.

## Docker

The current `Dockerfile`:

- uses `node:18-alpine`;
- installs dependencies with `npm install`;
- copies the project;
- exposes port 8080;
- runs `npm start`.

This currently starts the development-oriented `nodemon` / `ts-node-dev` command rather than building and running the webpack bundle. If Docker is intended for production, review the image to use a reproducible install (`npm ci`), build the bundle, and run `npm run prod`. Do not make that change without considering the intended deployment workflow.

## Operational gaps observed in this repository

- No test framework, test files, or useful `npm test` script were found.
- No database migration files or schema-management tool were found.
- The application creates a PostgreSQL pool but no explicit graceful-shutdown handling is visible in `src/app.ts`.
- No authentication/authorization middleware is registered in `src/route.ts`.
- The default CORS configuration allows `*`; review it before production use, especially with credentials.

These are observations about the inspected source, not claims that the wider deployment environment lacks these controls. Do not invent deployment practices that are not represented in the repository.
