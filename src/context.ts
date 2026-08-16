import { HealthController, resources } from "express-web-kit"
import { Middleware, MiddlewareController } from "middleware-logging"
import { Pool } from "pg"
import { PoolManager, PostgreSQLChecker } from "postgres-kit"
import { check } from "types-validation"
import { createValidator } from "validation-core"
import { UserController, useUserController } from "./user"

resources.createValidator = createValidator
resources.check = check

export interface ApplicationContext {
  health: HealthController
  middleware: MiddlewareController
  user: UserController
}

export function useContext(pool: Pool, midLogger: Middleware): ApplicationContext {
  const db = new PoolManager(pool)
  const middleware = new MiddlewareController(midLogger)
  const sqlChecker = new PostgreSQLChecker(pool)
  const health = new HealthController([sqlChecker])

  const user = useUserController(db)

  return { health, middleware, user }
}
