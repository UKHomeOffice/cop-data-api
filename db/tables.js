// local imports
const logger = require('../config/logger');
const pool = require('./index');

const getEntitiesOrViewsData = (role, name, filters) => new Promise((resolve, reject) => {
  pool.query(`SET ROLE ${role};`)
    .then(() => {
      if (filters === null) {
        logger.info(`Running query SELECT * FROM ${name};`);
        return pool.query(`SELECT * FROM ${name};`);
      }
      logger.info(`Running query SELECT * FROM ${name} WHERE ${filters};`);
      return pool.query(`SELECT * FROM ${name} WHERE ${filters};`);
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

module.exports = getEntitiesOrViewsData;
