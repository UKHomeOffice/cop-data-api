const express = require('express');

// local imports
const logger = require('../../config/logger')(__filename);
const query = require('../../db/query');
const { parameterizedQueryBuilder } = require('../../db/utils');

const app = express();

app.get('/:name', (req, res) => {
  const method = 'get';
  const queryParams = req.url.split('?')[1];
  const { name } = req.params;
  const { dbrole } = res.locals.user;

  if (name.startsWith('pg_') || Boolean(name.match(/\W/))) {
    return res.status(400).json({ 'error': 'Invalid entity' });
  }

  logger.debug(`Query parameters received: ${queryParams || 'None'}`);
  const { text, values } = parameterizedQueryBuilder({ name, method, queryParams });

  if (!text) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query(dbrole, name, text, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.post('/:name', (req, res) => {
  const method = 'post';
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { name } = req.params;
  const { prefer } = req.headers;

  logger.debug(`Body received: ${JSON.stringify(body)}`);

  if (Object.entries(body).length === 0) {
    return res.status(400).json({ 'error': 'Invalid post request' });
  }

  const { text, values } = parameterizedQueryBuilder({ name, method, body, prefer });
  const data = query(dbrole, name, text, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.patch('/:name/:id?', (req, res) => {
  const method = 'update';
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { id, name } = req.params;
  const { prefer } = req.headers;
  let queryParams = req.url.split('?')[1];
  queryParams = id ? `id=eq.${id}` : queryParams;

  logger.debug(`Body received: ${JSON.stringify(body)}`);

  if (Object.entries(body).length === 0 && (!id || !queryParams)) {
    return res.status(400).json({ 'error': 'Invalid patch request' });
  }

  const { text, values } = parameterizedQueryBuilder({ name, method, body, queryParams, prefer });
  const data = query(dbrole, name, text, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.delete('/:name', (req, res) => {
  const method = 'delete';
  const queryParams = req.url.split('?')[1];
  const { name } = req.params;
  const { dbrole } = res.locals.user;

  logger.debug(`Query parameters received: ${queryParams || 'None'}`);

  if (!queryParams) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const { text, values } = parameterizedQueryBuilder({ name, method, queryParams });
  const data = query(dbrole, name, text, values);

  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.post('/rpc/:name', (req, res) => {
  const method = 'post-rpc';
  const queryParams = req.url.split('?')[1];
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { name } = req.params;

  logger.debug(`Body received: ${JSON.stringify(body)}`);
  logger.debug(`Query parameters received: ${queryParams || 'None'}`);
  const { text, values } = parameterizedQueryBuilder({ name, method, body, queryParams });

  if (!text) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query(dbrole, name, text, values);
  Promise.all([data])
    .then(resultsArray => res.status(200).json(resultsArray[0]))
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

module.exports = app;
