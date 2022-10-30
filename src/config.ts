export const config = {
  port: 8080,
  allow: {
    origin: '*',
    credentials: 'true',
    methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
    headers: '*'
  },
  log: {
    level: 'info',
    map: {
      time: '@timestamp',
      msg: 'message'
    }
  },
  middleware: {
    log: true,
    skips: 'health,log,middleware',
    request: 'request',
    response: 'response',
    status: 'status',
    size: 'size'
  },
  db: {
    connectionString: 'postgres://xkjofgbu:MKmT3B0PPIZ6pr057wEHFUMvtad5nXex@satao.db.elephantsql.com/xkjofgbu'
  }
};

export const env = {
  sit: {
    db: {
      database: 'masterdata_sit',
    }
  },
  prd: {
    log: {
      level: 'error'
    },
    middleware: {
      log: false
    }
  }
};
