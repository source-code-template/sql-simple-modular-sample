import { Controller } from 'express-ext';
import { Manager, SearchResult } from 'onecore';
import { DB, Repository, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
export * from './user';

export class SqlUserRepository extends Repository<User, string> implements UserRepository {
  constructor(db: DB) {
    super(db, 'users', userModel.attributes);
  }
}
export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>, repository: UserRepository) {
    super(find, repository);
  }
}
export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: (msg: string) => void, userService: UserService) {
    super(log, userService);
  }
}

export function useUser(db: DB): UserService {
  const builder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
  const repository = new SqlUserRepository(db);
  return new UserManager(builder.search, repository);
}
export function useUserController(log: (msg: string) => void, db: DB): UserController {
  return new UserController(log, useUser(db));
}
