const { Pool } = require('pg');

// local imports
const logger = require('../config/logger');
const config = require('../config/core');

const { dbConnectionString, searchSchema } = config;

// todo -> searchSchema = operation;

const pool = new Pool({
  'connectionString': dbConnectionString,
});

pool.on('connect', (client) => {
  logger.info('New database connection established');
  client.query(`SET search_path TO "${searchSchema}";`);
});

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
