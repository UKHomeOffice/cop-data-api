const moment = require('moment');
const { Pool } = require('pg');

// local imports
const logger = require('../config/logger')(__filename);
const config = require('../config/core');

const { dbConnectionString, searchSchema } = config;

// todo -> searchSchema = operation;

const readPool = new Pool({ connectionString: dbConnectionString });
const writePool = new Pool({ connectionString: dbConnectionString });

readPool.on('connect', (client) => {
  client.query(`SET search_path TO "${searchSchema}";`);
  client.query(`SET ROLE ${config.dbRead}`);
});

readPool.on('error', (error, client) => {
  logger.error('Unexpected error on idle client', {
    error,
    timestamp: moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'),
  });
  process.exit(-1);
});

writePool.on('connect', (client) => {
  client.query(`SET search_path TO "${config.searchSchema}";`);
  client.query(`SET ROLE ${config.dbWrite}`);
});

writePool.on('error', (error, client) => {
  logger.error('Unexpected error on idle client', {
    error,
    timestamp: moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'),
  });
  process.exit(-1);
});

const getPool = (role = undefined) => {
  if (role === undefined || role === config.dbRead) {
    return readPool;
  }

  if (role === config.dbWrite) {
    return writePool;
  }
};

module.exports = getPool;
