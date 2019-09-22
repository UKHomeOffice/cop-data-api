const express = require('express');

// local imports
const logger = require('../../config/logger')(__filename);
const query2 = require('../../db/query');
const {
  deleteQueryBuilder,
  insertQueryBuilder,
  selectQueryBuilder,
  updateQueryBuilder,
} = require('../../db/utils');

const app = express();

app.get('/:name', (req, res) => {
  const { name } = req.params;
  const { dbrole } = res.locals.user;
  const queryParams = req.url.split('?')[1];

  logger.debug(`Query parameters received: ${queryParams ? queryParams : 'None'}`);
  const { queryString, values } = selectQueryBuilder({ name, queryParams });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query2(dbrole, name, queryString, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.post('/:name', (req, res) => {
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { name } = req.params;
  const { prefer } = req.headers;

  logger.debug(`Body received: ${JSON.stringify(body)}`);

  if (Object.entries(body).length === 0) {
    return res.status(400).json({ 'error': 'Invalid post request' });
  }

  const { queryString, values } = insertQueryBuilder({ name, body, prefer });
  const data = query2(dbrole, name, queryString, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.patch('/:name/:id?', (req, res) => {
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { id, name } = req.params;
  const { prefer } = req.headers;
  const queryParams = req.url.split('?')[1];

  logger.debug(`Body received: ${JSON.stringify(body)}`);

  if (Object.entries(body).length === 0 && (!id || !queryParams)) {
    return res.status(400).json({ 'error': 'Invalid patch request' });
  }

  const { queryString, values } = updateQueryBuilder({ name, body, id, queryParams, prefer });
  const data = query2(dbrole, name, queryString, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.delete('/:name', (req, res) => {
  const { name } = req.params;
  const { dbrole } = res.locals.user;
  const queryParams = req.url.split('?')[1];

  logger.debug(`Query parameters received: ${queryParams ? queryParams : 'None'}`);

  if (!queryParams) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const { queryString, values } = deleteQueryBuilder({ name, queryParams });
  const data = query2(dbrole, name, queryString, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.post('/rpc/:name', (req, res) => {
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { name } = req.params;
  const queryParams = req.url.split('?')[1];

  logger.debug(`Body received: ${JSON.stringify(body)}`);
  logger.debug(`Query parameters received: ${queryParams ? queryParams : 'None'}`);
  const { queryString, values } = selectQueryBuilder({ name, queryParams, body });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query2(dbrole, name, queryString, values);
  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

module.exports = app;
