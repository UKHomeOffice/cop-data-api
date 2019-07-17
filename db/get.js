// local imports
const logger = require('../config/logger');
const pool = require('./index');

const get = (role, name, query) => new Promise((resolve, reject) => {
  pool.query(`SET ROLE ${role};`)
    .then(() => {
      logger.info(`Running query ${query}`);
      return pool.query(`${query}`);
    })
    .then(data => resolve(data.rows))
    .catch((error) => {
      const errorMsg = `Unable to retrieve data from table ${name}`;
      logger.error(errorMsg);
      logger.error(error.stack);
      error.message = errorMsg;
      reject(new Error(errorMsg));
    });
});

module.exports = get;
