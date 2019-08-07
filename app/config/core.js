const config = {
  'logLevel': process.env.COP_DATA_API_LOG_LEVEL || 'info',
  'dbProtocol': process.env.DB_DATA_COP_PROTOCOL || 'postgres://',
  'dbPort': process.env.DB_DATA_COP_PORT || '5432',
  'dbHostname': process.env.DB_DATA_COP_HOSTNAME || 'localhost',
  'dbOptions': process.env.DB_DATA_COP_OPTIONS || '',
  'dbName' : process.env.DB_DATA_COP_OPERATION_DBNAME || 'operation',
  'dbUsername' : process.env.DB_DATA_COP_OPERATION_AUTHENTICATOR_USERNAME || 'authenticatoroperation',
  'dbPassword' : process.env.DB_DATA_COP_OPERATION_AUTHENTICATOR_PASSWORD || 'auth1234',
  'dbConnectionString': process.env.COP_DATA_API_DB_CONNECTION_STRING || '${dbProtocol}${dbUsername}:${dbPassword}@${dbHostname}:${dbPort}/${dbName}${dbOptions}',
  'searchSchema': process.env.DB_DATA_COP_OPERATION_SCHEMA || 'operation',
  'keycloakUrl': process.env.KEYCLOAK_URL || 'keycloak.lodev.xyz',
  'keycloakProtocol': process.env.KEYCLOAK_PROTOCOL || 'http://',
  'keycloakRealm': process.env.KEYCLOAK_REALM || 'dev',
  'iss': process.env.ISS || '${keycloakProtocol}${keycloakUrl}/auth/realms/${keycloakRealm}',
  'keycloak_client_id': process.env.COP_DATA_API_KEYCLOAK_CLIENT_ID || 'operational-data-api',
  'port': process.env.COP_DATA_API_PORT || '5000',
};

module.exports = config;
