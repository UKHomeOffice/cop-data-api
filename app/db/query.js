// local imports
const logger = require('../config/logger')(__filename);
const pool = require('./index');

const query2 = (role, name, queryString, values) => new Promise((resolve, reject) => {
  pool.query(`SET ROLE ${role};`)
    .then(() => {
      const queryObject = {
        'text': queryString,
        values,
      };
      logger.info('Running query');
      logger.debug(`Running query: ${queryString}, values: ${values}`);
      return pool.query(queryObject);
    })
    .then(data => resolve(data.rows))
    .catch((error) => {
      const errorMsg = `Unable to run query in table ${name}`;
      logger.error(errorMsg);
      logger.error(error.stack);
      error.message = errorMsg;
      reject(new Error(errorMsg));
    });
});

module.exports = query2;
