# Architecture

## Runtime overview

The application is a TypeScript HTTP API using Express 5 and PostgreSQL. Its application entry point is `src/app.ts`.

At startup, the application:

1. Loads `.env` through `dotenv`.
2. Merges the base configuration, process environment, and named environment configuration through `config-plus`.
3. Creates the logger and applies the configured log settings.
4. Creates the Express application and installs CORS/allow, JSON parsing, and request/response logging middleware.
5. Creates a PostgreSQL `Pool` from `cfg.db`.
6. Builds the application context with `useContext(pool, middleware)`.
7. Registers routes and starts an HTTP server on the configured port.

Do not move business-feature construction into `app.ts`; keep dependency assembly in `context.ts`.

## Layering and responsibilities

```text
src/app.ts
  startup, configuration, logger, middleware, DB pool, HTTP server
       |
       v
src/route.ts
  HTTP method + URL -> controller method
       |
       v
src/context.ts
  creates shared infrastructure and feature controller instances
       |
       v
src/<feature>/controller.ts
  HTTP request/response, validation, status codes, error mapping
       |
       v
src/<feature>/service.ts
  use-case / business layer; extends onecore UseCase where appropriate
       |
       v
src/<feature>/repository.ts
  persistence adapter; uses sql-core Repository and a feature model
       |
       v
postgres-kit / sql-core / pg
  PostgreSQL access
```

### Controller

A controller adapts Express requests to application operations. The existing `UserController`:

- receives a service in its constructor;
- binds public handler methods in the constructor so they can be passed directly to Express;
- extracts and formats request filters for search;
- obtains localized validation resources;
- validates request data;
- calls the service;
- chooses HTTP status codes and writes JSON responses;
- delegates exceptions to `handleError` from `express-web-kit`.

Keep SQL and business rules out of controllers.

### Service / use case

The existing `UserUseCase` extends `UseCase<User, string, UserFilter>` from `onecore` and implements the local `UserService` interface. It currently adds no custom business logic; the shared base class supplies the common CRUD/search behavior.

For a new feature, define a local service interface and use case when that matches the feature's needs. Put feature-specific business rules here. Do not add a service layer merely as an empty wrapper if the new feature has a materially different use-case shape; preserve the separation of concerns and explain the deviation.

### Repository

`SqlUserRepository` extends `Repository<User, string, UserFilter>` from `sql-core`, implements the local `UserRepository` interface, and calls `super(db, "users", userModel)`.

Use the repository as the persistence boundary. The generic repository receives the database abstraction, table name, and model metadata. The project source does not show handwritten SQL for the user CRUD operations.

### Feature composition

`src/user/index.ts` is the feature barrel and composition factory. `useUserController(db)` constructs the SQL repository, use case, and controller, then returns the controller. It also re-exports the feature's public controller and model types.

Follow this pattern for a feature that uses the same CRUD architecture. The root application context owns the call to the feature factory.

## Application composition

`src/context.ts` exports `ApplicationContext` and `useContext(pool, midLogger)`. It currently:

- wraps the `pg.Pool` in `PoolManager`;
- creates the middleware controller;
- creates a `PostgreSQLChecker` and exposes it through `HealthController`;
- creates the user controller through `useUserController(db)`;
- returns the application-facing controllers.

When adding a feature, add its controller to `ApplicationContext`, construct it in `useContext`, and return it. Avoid importing the concrete repository directly into `route.ts`.

## Routing

`src/route.ts` is the central route registry. It receives the Express `Application` and `ApplicationContext`. It registers health and middleware-management routes, then user routes. Route declarations should remain thin: HTTP method, path, optional middleware, and a context controller handler.

The existing user routes are documented in [HTTP API conventions](API.md).

## Shared localization / validation setup

At context-module initialization, the application assigns `createValidator` and `check` to the `resources` extension points imported from `express-web-kit`. Feature controllers use the local `getResource(req)` function to select language resources.

The local `src/resources/` directory contains English and Vietnamese message maps. Keep corresponding keys synchronized when adding localized labels or validation messages.

## Dependency direction

Keep dependencies pointing inward:

- Express-specific request and response code belongs in controllers and route registration.
- Feature interfaces and business rules belong in the feature module.
- SQL implementation belongs in repositories.
- Shared infrastructure is injected from `context.ts`.

A lower layer should not import a route or controller. A repository should not depend on Express. A controller should not instantiate a PostgreSQL pool or repository itself.
