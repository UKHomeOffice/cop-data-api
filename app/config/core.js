const formatKey = require('./formatKey');

const db = {
  protocol: process.env.DB_COP_PROTOCOL || 'postgres://',
  port: process.env.DB_COP_PORT || '5434',
  hostname: process.env.DB_COP_HOSTNAME || 'localhost',
  options: process.env.DB_COP_OPTIONS || '',
  name: process.env.DB_COP_OPERATION_DBNAME || 'transaction',
  username: process.env.DB_COP_OPERATION_AUTHENTICATOR_USERNAME || 'authenticator',
  password: process.env.DB_COP_OPERATION_AUTHENTICATOR_PASSWORD || 'auth1234',
};

const keycloak = {
  url: process.env.KEYCLOAK_URL || 'keycloak.lodev.xyz',
  protocol: process.env.KEYCLOAK_PROTOCOL || 'https://',
  realm: process.env.KEYCLOAK_REALM || 'cop-local',
};

const dbConnectionString = `${db.protocol}${db.username}:${db.password}@${db.hostname}:${db.port}/${db.name}${db.options}`;

const decodedKey = Buffer.from(process.env.API_COP_KEYCLOAK_CLIENT_PUBLIC_KEY, 'base64').toString();

const config = {
  logLevel: process.env.API_COP_LOG_LEVEL || 'info',
  dbConnectionString: process.env.DB_COP_CONNECTION_STRING || dbConnectionString,
  dbRead: process.env.DB_COP_READ_ROLE || 'readonly',
  dbWrite: process.env.DB_COP_WRITE_ROLE || 'service',
  searchSchema: process.env.DB_COP_OPERATION_SCHEMA || 'transaction',
  iss: process.env.ISS || `${keycloak.protocol}${keycloak.url}/realms/${keycloak.realm}`,
  keycloakClientId: process.env.API_COP_KEYCLOAK_CLIENT_ID || 'api-cop',
  keycloakClientPublicKey: formatKey(decodedKey),
  port: process.env.API_COP_PORT || '5000',
};

module.exports = config;
