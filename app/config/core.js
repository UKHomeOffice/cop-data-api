const config = {
  'logLevel': process.env.LOG_LEVEL || 'info',
  'dbConnectionString': process.env.DB_CONNECTION_STRING || 'postgres://authenticatoroperation:auth1234@localhost:5434/operation',
  'searchSchema': process.env.SEARCH_SCHEMA || 'operation',
  'iss': process.env.KEYCLOAK_URL || 'http://keycloak.lodev.xyz/auth/realms/dev',
  'keycloak_client_id': process.env.KEYCLOAK_CLIENT_ID || 'cop-data-api',
};

module.exports = config;
