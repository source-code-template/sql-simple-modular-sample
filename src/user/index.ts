import { Log, UseCase } from "onecore"
import { DB, Repository } from "query-core"
import { UserController } from "./controller"
import { User, UserFilter, userModel, UserRepository, UserService } from "./user"
export * from "./controller"

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

export function useUserController(db: DB, log: Log): UserController {
  const repository = new SqlUserRepository(db)
  const service = new UserUseCase(repository)
  return new UserController(log, service)
}
