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

readPool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

writePool.on('connect', (client) => {
  client.query(`SET search_path TO "${config.searchSchema}";`);
  client.query(`SET ROLE ${config.dbWrite}`);
});

writePool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
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
