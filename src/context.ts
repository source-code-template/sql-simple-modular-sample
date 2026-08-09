import { HealthController, resources } from "express-web-kit"
import { Middleware, MiddlewareController } from "middleware-logging"
import { createChecker, DB } from "sql-core"
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

export function useContext(db: DB, midLogger: Middleware): ApplicationContext {
  const middleware = new MiddlewareController(midLogger)
  const sqlChecker = createChecker(db)
  const health = new HealthController([sqlChecker])

  const user = useUserController(db)

  return { health, middleware, user }
}
