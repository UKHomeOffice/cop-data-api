const config = {
  'logLevel': process.env.LOG_LEVEL || 'info',
  'dbConnectionString': process.env.DB_CONNECTION_STRING || 'postgres://user:pass@localhost:5432/dbname',
  'searchSchema': process.env.SEARCH_SCHEMA || 'operation',
};

module.exports = config;
