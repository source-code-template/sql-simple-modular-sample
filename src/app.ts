import { merge } from "config-plus"
import dotenv from "dotenv"
import express, { json } from "express"
import { allow, MiddlewareLogger } from "express-core-web"
import http from "http"
import { createLogger, map, updateLog } from "logger-core"
import { Pool } from "pg"
import { PoolManager } from "pg-extension"
import { config, environments } from "./config"
import { useContext } from "./context"
import { route } from "./route"

const logger = createLogger(config.log)

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV, logger.error, logger.info)
updateLog(logger, cfg.log, map)

const app = express()
const middleware = new MiddlewareLogger(logger.info, cfg.middleware)
app.use(allow(cfg.allow), json(), middleware.log)

const pool = new Pool(cfg.db)
const db = new PoolManager(pool)
const ctx = useContext(db, logger, middleware)
route(app, ctx)
http.createServer(app).listen(cfg.port, () => {
  console.log("Start server at port " + cfg.port)
})
