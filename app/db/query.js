const moment = require('moment');

const logger = require('../config/logger')(__filename);
const getPool = require('./index');

const query = (role, name, queryString, values) => new Promise((resolve, reject) => {
  const pool = getPool(role);
  const queryObject = { text: queryString, values };

  logger.info('Running query');
  logger.debug(`Running query: ${queryString}, values: ${values}`);
  pool.query(queryObject)
    .then(data => resolve(data.rows))
    .catch((error) => {
      const errorMessage = `Unable to run query in table ${name}`;
      logger.error(errorMessage, {
        stack: error.stack,
        timestamp: moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'),
      });

      reject(new Error(errorMessage));
    });
});

module.exports = query;
