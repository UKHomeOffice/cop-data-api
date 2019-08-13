const config = {
  'logLevel': process.env.API_COP_LOG_LEVEL || 'info',
  'dbProtocol': process.env.DB_COP_PROTOCOL || 'postgres://',
  'dbPort': process.env.DB_COP_PORT || '5432',
  'dbHostname': process.env.DB_COP_HOSTNAME || 'localhost',
  'dbOptions': process.env.DB_COP_OPTIONS || '',
  'dbName': process.env.DB_COP_OPERATION_DBNAME || 'operation',
  'dbUsername': process.env.DB_COP_OPERATION_AUTHENTICATOR_USERNAME || 'authenticatoroperation',
  'dbPassword': process.env.DB_COP_OPERATION_AUTHENTICATOR_PASSWORD || 'auth1234',
  'dbConnectionString': process.env.DB_COP_CONNECTION_STRING || `$process.env.DB_COP_PROTOCOL$process.env.DB_COP_OPERATION_AUTHENTICATOR_USERNAME:$process.env.DB_COP_OPERATION_AUTHENTICATOR_PASSWORD@$process.env.DB_COP_HOSTNAME:$process.env.DB_COP_PORT/$process.env.DB_COP_OPERATION_DBNAME$process.env.DB_COP_OPTIONS`,
  'searchSchema': process.env.DB_COP_OPERATION_SCHEMA || 'operation',
  'keycloakUrl': process.env.KEYCLOAK_URL || 'keycloak.lodev.xyz',
  'keycloakProtocol': process.env.KEYCLOAK_PROTOCOL || 'http://',
  'keycloakRealm': process.env.KEYCLOAK_REALM || 'dev',
  'iss': process.env.ISS || `$keycloakProtocol$process.env.KEYCLOAK_URL/auth/realms/$process.env.KEYCLOAK_REALM`,
  'keycloak_client_id': process.env.API_COP_KEYCLOAK_CLIENT_ID || 'operational-data-api',
  'port': process.env.API_COP_PORT || '5000',
};

module.exports = config;
