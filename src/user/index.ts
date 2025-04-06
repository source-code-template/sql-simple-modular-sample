import { Controller } from "express-ext"
import { Log, Search, UseCase } from "onecore"
import { DB, Repository, SearchBuilder } from "query-core"
import { User, UserFilter, userModel, UserRepository, UserService } from "./user"
export * from "./user"

export class SqlUserRepository extends Repository<User, string> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel)
  }
}
export class UserUseCase extends UseCase<User, string, UserFilter> implements UserService {
  constructor(search: Search<User, UserFilter>, repository: UserRepository) {
    super(search, repository)
  }
}
export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: Log, service: UserService) {
    super(log, service)
  }
}

export function useUserController(log: Log, db: DB): UserController {
  const builder = new SearchBuilder<User, UserFilter>(db.query, "users", userModel, db.driver)
  const repository = new SqlUserRepository(db)
  const service = new UserUseCase(builder.search, repository)
  return new UserController(log, service)
}
