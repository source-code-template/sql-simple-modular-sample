import { Controller } from "express-ext"
import { Log } from "onecore"
import { User, UserFilter, UserService } from "./user"
export * from "./user"

export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: Log, service: UserService) {
    super(log, service)
  }
}
