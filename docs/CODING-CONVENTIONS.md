# Coding Conventions

These conventions are based on the checked-in source and `.prettierrc.json`. When a convention is not demonstrated by the code, do not invent a strict rule; follow nearby code and keep changes consistent.

## TypeScript style

- Use TypeScript for application source under `src/`.
- Use `strict: true`; avoid weakening types to make a change compile.
- Use ES module `import` / `export` syntax.
- Use double-quoted strings.
- Omit semicolons.
- Use two spaces for indentation.
- Keep trailing commas in multiline object/argument structures.
- The configured Prettier `printWidth` is 260; do not reformat the whole project to a different width without a specific reason.
- Use braces for control-flow blocks, including one-line branches.
- Prefer explicit interfaces for feature models and service/repository contracts.

The checked-in Prettier settings are:

```json
{
  "printWidth": 260,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": false
}
```

## Naming

| Element | Existing style | Example |
|---|---|---|
| Feature directory | lowercase singular | `src/user/` |
| Source file | lowercase descriptive name | `controller.ts`, `repository.ts` |
| Class | PascalCase | `UserController`, `SqlUserRepository`, `UserUseCase` |
| Interface / type | PascalCase | `User`, `UserFilter`, `UserService` |
| Function / variable | camelCase | `useUserController`, `userModel`, `getResource` |
| Constant model metadata | camelCase | `userModel` |
| SQL table / column | lowercase snake_case | `users`, `date_of_birth` |
| TypeScript property | camelCase | `dateOfBirth` |

## Feature file layout

The current feature layout is:

```text
src/<feature>/
  controller.ts   # Express-facing controller
  index.ts        # public exports and construction factory
  repository.ts   # persistence adapter
  service.ts      # use case / service implementation
  <feature>.ts    # model, filter, ports/interfaces, validation metadata
```

Use only the files needed by the feature, but keep each responsibility in the appropriate layer. If the feature needs multiple models or use cases, add clearly named files rather than making one file a catch-all.

## Types and interfaces

- Define feature data types and the feature's repository/service contracts close to the feature, as `User`, `UserFilter`, `UserRepository`, and `UserService` are defined in `src/user/user.ts`.
- Prefer domain types over unstructured `any`.
- The existing controller uses Express `Request` and `Response` types.
- The existing repository and use case implement their local interfaces explicitly.
- Do not make a field optional or required based only on the SQL nullability; decide and document the API/domain contract separately. Keep TypeScript, validation metadata, and SQL constraints aligned when possible.

## Model metadata

The project uses `Attributes` from `onecore` for `sql-core` persistence metadata and `validation-core` validation. The `userModel` example demonstrates:

- `key: true` for the primary key;
- `length` for length constraints;
- `required: true` for required validation;
- `format` for format validation;
- `column` to map a TypeScript property to a differently named SQL column;
- `type` for type metadata;
- `resource` to resolve a localized field label.

Do not assume every metadata property has only one effect: the same model is used by the repository and validation paths. Inspect the relevant installed library types/source before adding metadata whose semantics are unclear.

## Controller conventions

- Bind handler methods in the constructor when passing instance methods directly to Express, as `UserController` does.
- Use `fromRequest<T>(req, [...])` for request-derived search filters, following the local pattern.
- Use `format(filter, [...])` for fields that require request-value conversion, following the local date filter example.
- Use `getResource(req)` and `validate<T>(...)` for localized model validation.
- Use `handleError(err, res)` for caught controller errors.
- Return JSON with an explicit HTTP status.
- Use `isSuccessful(result)` where the existing use case returns a `Result<T>` and the controller needs to distinguish success from a conflict/not-found outcome.

## Resource conventions

Add new field labels or validation text in both:

- `src/resources/en.ts`
- `src/resources/vi.ts`

Use the same key in both files. Use the key in model metadata through `resource` when appropriate. `getResource` defaults to English and accepts a language code from a string or the request's `lang` query parameter.

## Error and logging conventions

- Controller-level operational errors are passed to `handleError`.
- Startup and middleware logging use `logger-core` and `middleware-logging` as wired in `src/app.ts`.
- Do not log credentials, access tokens, or unmasked personal data.
- The application passes masking callbacks for `phone` and `email` into `MiddlewareLogger`. These callbacks are intended for log masking; do not describe them as cryptographic encryption or assume they mutate HTTP responses without checking the middleware implementation.
