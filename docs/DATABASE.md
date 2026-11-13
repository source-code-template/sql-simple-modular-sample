# Database and Model Mapping

## Supplied database contract

The project is described as using this PostgreSQL table definition:

```sql
create table if not exists users (
  id varchar(40) not null,
  username varchar(120),
  email varchar(120),
  phone varchar(45),
  date_of_birth date,
  primary key (id)
);
```

Important implications of this DDL:

- `id` is the only `NOT NULL` field and is the primary key.
- `id` has no database default in the supplied definition. A create operation must therefore provide an ID unless the actual deployed schema has an additional default or trigger.
- `username`, `email`, `phone`, and `date_of_birth` are nullable at the database level.
- `date_of_birth` is a SQL `date`, not a timestamp.

Treat this schema as the stated database contract. Check the real migration/schema before making production changes; no migration files are present in this repository.

## Current TypeScript model

The model is in `src/user/user.ts`:

| TypeScript property | SQL column | TypeScript type | Current metadata |
|---|---|---|---|
| `id` | `id` | `string` | `key: true`, `length: 40` |
| `username` | `username` | `string` | `required: true`, `length: 255`, `resource: "username"` |
| `email` | `email` | `string?` | `format: "email"`, `required: true`, `length: 120` |
| `phone` | `phone` | `string?` | `format: "phone"`, `required: true`, `length: 14` |
| `dateOfBirth` | `date_of_birth` | `Date?` | `column: "date_of_birth"`, `type: "datetime"` |

`dateOfBirth` is also used in `UserFilter` as `Date | DateRange`, and the search controller calls `format(filter, ["dateOfBirth"])`. In the current `UserFilter` interface, `id` and `username` are non-optional while `email`, `phone`, and `dateOfBirth` are optional. For a new search/filter type, make fields optional when callers are allowed to omit them; do not copy the current required `id` / `username` typing unless it is an intentional contract.

## Discrepancies that must not be copied blindly

The current metadata, interfaces, and supplied DDL do not fully agree:

| Field | Supplied SQL | Current TypeScript / validation | What an agent must do |
|---|---|---|---|
| `username` | nullable, max 120 chars | `User.username` is required; metadata requires it and allows length 255 | Preserve current API validation only when compatible with the requested behavior; do not assume SQL allows 255. Prefer aligning metadata to 120 after confirming intended API rules. |
| `email` | nullable, max 120 chars | optional in `User`, but metadata has `required: true` | Decide whether email is optional or required at the API/business level, then align the interface and metadata. Do not infer it from the DDL alone. |
| `phone` | nullable, max 45 chars | optional in `User`, but metadata has `required: true` and length 14 | Decide the API requirement and intended phone format/maximum. `14` may be an intentional input rule, but it is not the SQL column limit. |
| `dateOfBirth` | SQL `date` | metadata says `type: "datetime"` | Confirm the supported `sql-core` metadata type for a date-only value and avoid accidental time/time-zone conversion. |

These are existing inconsistencies, not evidence that the supplied SQL is wrong. Do not silently change the database, API contract, or existing validation behavior as part of an unrelated feature.

## Mapping rules for new models

- Use camelCase in TypeScript and snake_case in SQL where that is the established database naming convention.
- Specify `column: "snake_case_name"` when a property name differs from its SQL column.
- Mark the primary key with `key: true` in the `Attributes` metadata.
- Keep `length`, `required`, `format`, and `type` consistent with the actual database and the intended API/domain rules.
- Distinguish SQL nullability from API requiredness. A nullable database column can still be required by the API, but that must be an explicit business rule.
- Do not assume IDs are generated. Check the schema and existing creation flow; the supplied `users.id` has no default.
- For SQL date-only fields, preserve date-only semantics. Do not introduce a timestamp without a business requirement.
- Keep migration/schema changes separate and explicit. No migration framework or migration files were found in the inspected project.

## Persistence pattern

The current user repository uses the shared SQL abstraction:

```ts
export class SqlUserRepository extends Repository<User, string, UserFilter> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel)
  }
}
```

For a similar feature, prefer `sql-core`'s `Repository` with the correct entity, key, filter, table name, and `Attributes` model. Keep the repository implementation behind a local repository interface. Add custom persistence methods only when the feature needs behavior that the generic repository does not provide; inspect the installed `sql-core` API before implementing them.
