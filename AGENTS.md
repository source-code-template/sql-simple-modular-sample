# AI Agent Guide

This file is the entry point for AI coding agents working in this repository. Read it before changing source code.

## Project at a glance

This repository is a small TypeScript backend built with Express 5 and PostgreSQL. It demonstrates a modular, feature-oriented structure. The existing `user` feature is the reference implementation for adding another business feature.

The normal dependency flow is:

```text
HTTP route
   -> Controller
      -> Service / Use case
         -> Repository
            -> sql-core / PostgreSQL
```

Application-wide dependencies are assembled in `src/context.ts`. HTTP endpoints are registered in `src/route.ts`. The server and middleware are configured in `src/app.ts`.

## Required reading

Before implementing a feature, read the relevant documents:

- [Architecture](docs/ARCHITECTURE.md) — module boundaries, dependency flow, and application composition.
- [Feature development](docs/FEATURE-DEVELOPMENT.md) — the required steps and file pattern for a new feature.
- [Coding conventions](docs/CODING-CONVENTIONS.md) — TypeScript, naming, formatting, and error-handling style.
- [Database and models](docs/DATABASE.md) — the supplied SQL schema, field mapping, and current model/schema discrepancies.
- [HTTP API conventions](docs/API.md) — routing, validation, request parsing, and response behavior.
- [Build and operations](docs/BUILD-AND-OPERATIONS.md) — scripts, configuration, Docker, and known operational gaps.

## Rules for making changes

1. **Follow the existing feature structure.** Put feature-specific code under `src/<feature>/` and keep HTTP, business/use-case, and persistence responsibilities separate.
2. **Use `src/user/` as the primary local example.** Reuse its controller, service, repository, model, and `index.ts` factory pattern unless the new feature has a clear reason to differ.
3. **Keep the dependency direction.** Routes depend on controllers; controllers depend on service interfaces; use cases depend on repository interfaces; SQL repositories implement those interfaces. Do not put SQL or PostgreSQL calls in controllers.
4. **Wire dependencies explicitly.** Add feature construction to `src/context.ts` and register endpoints in `src/route.ts`. Do not create hidden global service instances.
5. **Keep transport concerns in controllers.** Parse HTTP input, run validation, select status codes, serialize responses, and call `handleError` there. Put business decisions in the service/use case.
6. **Use the existing shared libraries.** Prefer the already-used `onecore`, `sql-core`, `postgres-kit`, `express-web-kit`, and `validation-core` abstractions. Do not add a dependency or introduce a new framework for a routine feature.
7. **Keep model naming consistent.** Use camelCase in TypeScript and map snake_case SQL columns with the `column` property in the `Attributes` model.
8. **Update both language resources.** When adding a validation/resource label, add the matching key to `src/resources/en.ts` and `src/resources/vi.ts`.
9. **Preserve database truth.** Treat the SQL schema documented in `docs/DATABASE.md` as the provided database contract. Do not infer that TypeScript optionality, validation requirements, or ORM metadata change the SQL schema. Resolve discrepancies deliberately and document any approved change.
10. **Do not invent library APIs.** If an imported package's behavior or signature is unclear, inspect installed package types/source or its official documentation before using it. The repository does not include implementations of its dependencies.
11. **Do not claim tests passed unless they were run.** `package.json` currently has a placeholder `test` script that exits with an error, and no test files or test framework are present.
12. **Avoid unrelated refactoring.** Keep a feature change focused and preserve established public API behavior unless the task explicitly requests a breaking change.

## Before finishing a change

- Check that the route is registered and the feature is constructed in the application context.
- Check TypeScript types, validation metadata, and SQL column definitions together.
- Check that request/response behavior follows `docs/API.md`.
- Check that English and Vietnamese resource keys stay aligned.
- Run the checks that are actually available. Report clearly if dependencies or a test harness are unavailable.
- Update the relevant documentation when adding routes, configuration, data fields, or architectural patterns.

## Existing project boundaries and caveats

- There is currently one business feature: `src/user/`.
- PostgreSQL is connected through `pg.Pool`, wrapped by `postgres-kit`'s `PoolManager` and consumed through `sql-core`'s `DB` / `Repository` abstractions.
- No authentication or authorization flow is currently implemented in the inspected source.
- No automated test framework or actual test suite is currently present.
- The current `users` TypeScript model and validation metadata do not perfectly match the supplied SQL schema. See [Database and models](docs/DATABASE.md); do not copy those mismatches into new features.
