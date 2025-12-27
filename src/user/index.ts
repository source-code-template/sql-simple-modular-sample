import { Controller } from "express-ext"
import { Log, UseCase } from "onecore"
import { DB, Repository } from "query-core"
import { User, UserFilter, userModel, UserRepository, UserService } from "./user"
export * from "./user"

export class SqlUserRepository extends Repository<User, string, UserFilter> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel, db.driver)
  }
}
export class UserUseCase extends UseCase<User, string, UserFilter> implements UserService {
  constructor(repository: UserRepository) {
    super(repository)
  }
}
export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: Log, service: UserService) {
    super(log, service)
  }
}

export function useUserController(log: Log, db: DB): UserController {
  // const builder = new SearchBuilder<User, UserFilter>(db.query, "users", userModel, undefined, db.driver)
  const repository = new SqlUserRepository(db)
  const service = new UserUseCase(repository)
  return new UserController(log, service)
}
