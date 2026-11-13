# HTTP API Conventions

## General pattern

Routes are registered in `src/route.ts` and dispatch to controller methods obtained from `ApplicationContext`. Controllers use Express `Request` / `Response` types, return JSON, set explicit status codes, and pass caught errors to `handleError` from `express-web-kit`.

The current API is a sample user CRUD/search API. No authentication or authorization middleware is registered in the inspected route file.

## Existing routes

| Method | Path | Handler / purpose | Current response behavior |
|---|---|---|---|
| `GET` | `/health` | `ctx.health.check` | Health check response provided by `express-web-kit` |
| `PATCH` | `/middleware` | `ctx.middleware.config` | Middleware configuration endpoint provided by `middleware-logging` |
| `POST` | `/users/search` | `ctx.user.search` | Search result, HTTP 200 |
| `GET` | `/users/search` | `ctx.user.search` | Search result, HTTP 200 |
| `GET` | `/users/:id` | `ctx.user.load` | HTTP 200 when found; 404 when absent; JSON body is the user or `null` |
| `POST` | `/users` | `check(userModel)`, then `ctx.user.create` | HTTP 201 when `isSuccessful(result)`; otherwise 409 |
| `PUT` | `/users/:id` | `check(userModel)`, then `ctx.user.update` | HTTP 200 when successful; otherwise 404 |
| `PATCH` | `/users/:id` | `check(userModel)`, then `ctx.user.patch` | HTTP 200 when successful; otherwise 404 |
| `DELETE` | `/users/:id` | `ctx.user.delete` | HTTP 200 when deleted count is positive; otherwise 410 |

These statuses describe the current implementation; preserve them for compatibility unless a task explicitly requests an API change.

Register more specific/static paths before overlapping parameterized paths. In the current registry, `/users/search` is registered before `/users/:id`; preserve this order when adding routes whose paths could otherwise match a parameter segment.

## Search request handling

The current `UserController.search`:

1. Calls `fromRequest<UserFilter>(req, ["fields"])`.
2. Calls `format(filter, ["dateOfBirth"])`.
3. Reads `limit`, `page`, and `fields` from the filter.
4. Calls `service.search(filter, limit, page, fields)`.
5. Returns the result as JSON with HTTP 200.

Both `GET /users/search` and `POST /users/search` call the same controller method. Follow this behavior for comparable search endpoints unless there is a clear reason to use a different contract. Check `express-web-kit` / `onecore` definitions before assuming details such as default pagination or accepted filter syntax.

## Validation flow

The route registry creates `const checkUser = check(userModel)` and applies it to create, update, and patch routes. The controller then performs localized validation:

- `getResource(req)` selects the language resource map.
- `validate<User>(user, userModel, resource)` validates create and update.
- `validate<User>(user, userModel, resource, false, true)` is used for patch.
- `getStatusCode(errors)` selects the HTTP status for validation errors.
- Validation errors are returned as JSON and the response is ended.

The route middleware and controller validation both use the model. Do not remove one or change the validation flags without checking the external library behavior and preserving localized error responses.

## Create / update / patch details

- `create` treats `req.body` as `User` and does not generate an ID in the controller. The supplied DDL has no ID default, so clients or another explicitly implemented layer must provide it.
- `update` overwrites `user.id` with `req.params.id` before validation and service invocation.
- `patch` also sets the ID from the path and invokes partial validation using the existing flags.
- Keep the path parameter authoritative for update and patch; do not trust a body-supplied ID for those operations.

## Error handling and response style

Use the existing controller pattern:

- return JSON for success and expected non-success outcomes;
- set the status explicitly with `res.status(status).json(...)`;
- use `handleError(err, res)` in `catch` blocks;
- return immediately after sending a validation error response.

Do not invent a new global response envelope or error format in one feature. If a consistent API-wide envelope is requested, treat it as an API design change and update all affected endpoints and documentation together.

## Adding an endpoint

1. Add the handler to the feature controller and bind it in the constructor if it is passed as an instance method.
2. Add or update the service interface and use-case implementation if the operation is a business use case.
3. Add repository interface/implementation behavior only if persistence is required.
4. Expose the controller through the feature factory and `ApplicationContext`.
5. Register the route in `src/route.ts` with any existing validation middleware pattern.
6. Document method, path, input, and response behavior here or in a feature-specific API document.
