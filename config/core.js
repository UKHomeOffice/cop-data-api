const config = {
  'logLevel': process.env.LOG_LEVEL || 'info',
  'dbConnectionString': process.env.DB_CONNECTION_STRING || 'postgres://authenticatoroperation:auth1234@localhost:5434/operation',
  'searchSchema': process.env.SEARCH_SCHEMA || 'operation',
};

module.exports = config;
