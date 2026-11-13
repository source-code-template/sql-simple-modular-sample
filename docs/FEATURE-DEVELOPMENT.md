# Feature Development Guide

Use the existing `user` module as the concrete example when adding another CRUD-style feature. The goal is to keep HTTP handling, use-case logic, and persistence independently understandable.

## 1. Create a feature module

Create a lowercase feature directory under `src/`, for example:

```text
src/<feature>/
  <feature>.ts
  repository.ts
  service.ts
  controller.ts
  index.ts
```

The names shown match the current `src/user/` structure. Add extra files only when they have a distinct responsibility.

## 2. Define the model and contracts

In `<feature>.ts`, define:

- the entity interface;
- the search/filter interface, extending `Filter` when it is compatible with the feature;
- a repository interface for persistence operations;
- a service interface for application operations;
- an `Attributes` model that maps TypeScript fields to the SQL table.

The current `User` feature is the local reference. Keep the entity and filter types aligned with actual nullability, and distinguish optional API fields from database nullability. Map differently named SQL columns explicitly using `column`.

Before writing metadata, check the table DDL and the installed `onecore`, `sql-core`, and validation package types. Do not guess metadata semantics.

## 3. Implement the repository

For a standard SQL CRUD feature, follow `src/user/repository.ts`:

```ts
import { DB, Repository } from "sql-core"
import { Feature, FeatureFilter, featureModel, FeatureRepository } from "./feature"

export class SqlFeatureRepository extends Repository<Feature, string, FeatureFilter> implements FeatureRepository {
  constructor(db: DB) {
    super(db, "feature_table", featureModel)
  }
}
```

Replace the sample type names, key type, table name, and model with the real feature definitions. The snippet assumes a string primary key, as the user feature does; choose the actual key type for the new table. Do not add raw SQL or assume undocumented `sql-core` methods without inspecting the dependency API.

## 4. Implement the use case

For a CRUD feature compatible with `onecore.UseCase`, follow `src/user/service.ts`:

```ts
import { UseCase } from "onecore"
import { Feature, FeatureFilter, FeatureRepository, FeatureService } from "./feature"

export class FeatureUseCase extends UseCase<Feature, string, FeatureFilter> implements FeatureService {
  constructor(repository: FeatureRepository) {
    super(repository)
  }
}
```

Use the real primary-key type and interfaces. Add business rules here rather than in the controller or repository. If the feature is not a generic CRUD use case, implement its service interface directly while retaining the layer boundary.

## 5. Implement the controller

Follow `src/user/controller.ts` for Express-facing behavior:

- import `Request` and `Response` from `express`;
- inject the service through the constructor;
- bind handler methods in the constructor;
- parse route parameters and request filters;
- validate input with the feature model and localized resources;
- call the service;
- map outcomes to explicit HTTP status codes;
- call `handleError` for caught errors.

Do not put business logic or DB queries in the controller. Document any endpoint-specific status behavior.

## 6. Add a composition factory

In the feature `index.ts`, export the public model/controller types and provide a `use<Feature>Controller(db: DB)` factory, following `src/user/index.ts`:

```ts
export function useFeatureController(db: DB): FeatureController {
  const repository = new SqlFeatureRepository(db)
  const service = new FeatureUseCase(repository)
  return new FeatureController(service)
}
```

Use the actual feature types and class names. Keep object construction in this factory rather than in route declarations.

## 7. Register the feature in the application

Update `src/context.ts`:

1. Import the feature controller and factory.
2. Add the controller to `ApplicationContext`.
3. Call the factory with the existing `db` abstraction inside `useContext`.
4. Include the controller in the returned context object.

Update `src/route.ts` to register the feature routes using `ctx.<feature>`.

## 8. Add localization and validation

When adding field labels or custom validation messages, add matching keys to both `src/resources/en.ts` and `src/resources/vi.ts`. Use the same keys in model metadata. Keep the route-level `check(model)` and controller-level localized `validate(...)` pattern consistent with the existing API unless the external library behavior has been verified and a deliberate alternative is documented.

## 9. Verify the change

At minimum:

- inspect the final diff for unintended changes;
- check that all imports and exports resolve;
- check the feature is constructed by `useContext` and reachable from a registered route;
- compare TypeScript fields, model metadata, and SQL schema;
- check both language maps;
- run `npm run build` when dependencies are installed;
- run automated tests only if a test harness exists or one is deliberately added.

The current `npm test` command is a placeholder that exits with an error. Do not report it as a successful test suite. Document any manual verification performed.

## 10. Keep docs in sync

Update the relevant docs when the feature changes the architecture, API, schema, environment configuration, scripts, or operational behavior. Add a feature-specific document if its rules are too detailed for the shared guides.
