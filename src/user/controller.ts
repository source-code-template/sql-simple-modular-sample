import { Request, Response } from "express"
import { format, fromRequest, getStatusCode, handleError, queryLimit, queryPage } from "express-ext"
import { isSuccessful, Log } from "onecore"
import { validate } from "xvalidators"
import { getResource } from "../resources"
import { User, UserFilter, userModel, UserService } from "./user"

export class UserController {
  constructor(protected service: UserService, protected log: Log) {
    this.search = this.search.bind(this)
    this.load = this.load.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.patch = this.patch.bind(this)
    this.delete = this.delete.bind(this)
  }
  search(req: Request, res: Response) {
    const filter = fromRequest<UserFilter>(req, ["status", "fields"])
    format(filter, ["dateOfBirth"])
    const page = queryPage(req, filter)
    const limit = queryLimit(req)
    this.service
      .search(filter, limit, page, filter.fields)
      .then((result) => res.status(200).json(result))
      .catch((err) => handleError(err, res, this.log))
  }
  async load(req: Request, res: Response) {
    const id = req.params.id
    try {
      const user = await this.service.load(id)
      const status = user ? 200 : 404
      res.status(status).json(user).end()
    } catch (err) {
      handleError(err, res, this.log)
    }
  }
  create(req: Request, res: Response) {
    const resource = getResource(req)
    const user = req.body as User
    const errors = validate<User>(user, userModel, resource)
    if (errors.length > 0) {
      return res.status(getStatusCode(errors)).json(errors).end()
    }
    this.service
      .create(user)
      .then((result) => {
        const status = isSuccessful(result) ? 201 : 409
        res.status(status).json(result).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  async update(req: Request, res: Response) {
    const resource = getResource(req)
    const user = req.body as User
    user.id = req.params.id
    const errors = validate<User>(user, userModel, resource)
    if (errors.length > 0) {
      return res.status(getStatusCode(errors)).json(errors).end()
    }
    try {
      const result = await this.service.update(user)
      const status = isSuccessful(result) ? 200 : 404
      res.status(status).json(result).end()
    } catch (err) {
      handleError(err, res, this.log)
    }
  }
  patch(req: Request, res: Response) {
    const resource = getResource(req)
    const user = req.body as User
    user.id = req.params.id
    const errors = validate<User>(user, userModel, resource, false, true)
    if (errors.length > 0) {
      return res.status(getStatusCode(errors)).json(errors).end()
    }
    this.service
      .patch(user)
      .then((result) => {
        const status = isSuccessful(result) ? 200 : 404
        res.status(status).json(result).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  delete(req: Request, res: Response) {
    const id = req.params.id
    this.service
      .delete(id)
      .then((count) => {
        const status = count > 0 ? 200 : 410
        res.status(status).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
}
