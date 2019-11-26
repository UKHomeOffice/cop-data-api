const express = require('express');

// local imports
const logger = require('../../config/logger')(__filename);
const query = require('../../db/query');
const { selectQueryBuilderV2 } = require('../../db/utils');

const app = express();

app.get('/:name', (req, res) => {
  const queryParams = req.query;
  const { name } = req.params;
  const { dbrole } = res.locals.user;

  logger.debug(`Query parameters received: ${queryParams}`);

  if (queryParams.filter && !Array.isArray(queryParams.filter)) {
    queryParams.filter = [queryParams.filter];
  }

  const { queryString, values } = selectQueryBuilderV2({ name, queryParams });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query(dbrole, name, queryString, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.delete('/:name', (req, res) => {
  const queryParams = req.query;
  queryParams.delete = true;

  const { name } = req.params;
  const { dbrole } = res.locals.user;
  logger.debug(`Query parameters received: ${queryParams}`);

  if (queryParams.filter && !Array.isArray(queryParams.filter)) {
    queryParams.filter = [queryParams.filter];
  }

  const { queryString, values } = selectQueryBuilderV2({ name, queryParams });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query(dbrole, name, queryString, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

module.exports = app;
