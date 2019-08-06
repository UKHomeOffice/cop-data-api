const config = {
  'logLevel': process.env.COP_DATA_API_LOG_LEVEL || 'info',
  'dbConnectionString': process.env.COP_DATA_API_DB_CONNECTION_STRING || 'postgres://authenticatoroperation:auth1234@localhost:5434/operation',
  'searchSchema': process.env.COP_DATA_API_SEARCH_SCHEMA || 'operation',
  'iss': process.env.KEYCLOAK_URL || 'http://keycloak.lodev.xyz/auth/realms/dev',
  'keycloak_client_id': process.env.COP_DATA_API_KEYCLOAK_CLIENT_ID || 'operational-data-api',
  'port': process.env.COP_DATA_API_PORT || '5000',
};

module.exports = config;
