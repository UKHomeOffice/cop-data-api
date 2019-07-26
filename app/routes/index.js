const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const jwtDecode = require('jwt-decode');
const moment = require('moment');

// local imports
const config = require('../config/core');
const query = require('../db/query');
const logger = require('../config/logger');
const queryBuilder = require('../db/utils');

const app = express();
const corsConfiguration = {
  'origin': '*',
  'methods': ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  'allowedHeaders': ['Content-Type', 'Authorization'],
};
app.use(cors(corsConfiguration));
// 'extended': 'true' allows the values of the objects passed, to be of any type
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
// check each request for authorization token
app.use((req, res, next) => {
  if (req.headers.authorization) {
    // decode the keycloak jwt token
    const token = jwtDecode(req.headers.authorization);
    const tokenExpiryDate = moment(token.exp * 1000);
    const currentDate = moment(new Date());

    // check token belongs to our SSO
    if (token.iss !== config.iss) {
      logger.error(`${req.method} - ${req.url} - Request by ${token.name}, Token not valid for our SSO endpoint - token presented: ${token.iss}`);
      res.status(401).json({ 'error': 'Unauthorized' });
    }
    // check our client id is present in aud claim
    else if (token.aud.indexOf(config.keycloak_client_id) === -1) {
      logger.error(`${req.method} - ${req.url} - Request by ${token.name}, Token did not present the correct audience claims for this endpoint - token aud presented: ${token.aud}`);
      res.status(401).json({ 'error': 'Unauthorized' });
    }
    // check if the token expiry time is in the future
    else if (currentDate.unix() < tokenExpiryDate.unix()) {
      logger.info(`${req.method} - ${req.url} - Request by ${token.name}, ${token.email} - Token valid until - ${tokenExpiryDate.format()}`);
      res.locals.user = token;
      // process request
      next();
    } else {
      logger.error(`${req.method} - ${req.url} - Request by ${token.name}, ${token.email} - Unauthorized - Token expired at ${tokenExpiryDate.format()}`);
      res.status(401).json({ 'error': 'Unauthorized' });
    }
  } else if (req.path !== '/_health') {
    // not an health check and no authorization token was passed,
    // don't process the request further
    res.status(401).json({ 'error': 'Unauthorized' });
  } else {
    // process request for `/_health`
    next();
  }
});

app.options('*', cors(corsConfiguration));

app.get('/_health', (req, res) => {
  logger.verbose('API is Alive & Kicking!');
  return res.status(200).json({ 'status': 'UP' });
});

app.get('/v1/:name', (req, res) => {
  const { name } = req.params;
  const { dbrole } = res.locals.user;
  const queryParams = req.url.split('?')[1];
  const queryString = queryBuilder(name, { queryParams });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' })
  }

  const data = query(dbrole, name, queryString);
  Promise.all([data])
    .then((resultsArray) => {
      return res.status(200).json(resultsArray[0])
    })
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.post('/v1/:name', (req, res) => {
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { name } = req.params;
  const { prefer } = req.headers;
  const queryString = queryBuilder(name, { body, method: req.method, prefer });

  const data = query(dbrole, name, queryString);
  Promise.all([data])
    .then((resultsArray) => {
      return res.status(200).json(resultsArray[0])
    })
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.delete('/v1/:name', (req, res) => {
  const { name } = req.params;
  const { dbrole } = res.locals.user;
  const queryParams = req.url.split('?')[1];
  const queryString = queryBuilder(name, { queryParams, method: req.method });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' })
  }

  const data = query(dbrole, name, queryString);
  Promise.all([data])
    .then((resultsArray) => {
      return res.status(200).json(resultsArray[0])
    })
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

app.post('/v1/rpc/:name', (req, res) => {
  const { body } = req;
  const { dbrole } = res.locals.user;
  const { name } = req.params;
  const queryParams = req.url.split('?')[1];
  const queryString = queryBuilder(name, { queryParams, body });

  if (!queryString) {
    return res.status(400).json({ 'error': 'Invalid query parameters' });
  }

  const data = query(dbrole, name, queryString);
  Promise.all([data])
    .then((resultsArray) => {
      return res.status(200).json(resultsArray[0])
    })
    .catch((error) => {
      logger.error(error.stack);
      res.status(400).json({ 'error': error.message });
    });
});

module.exports = app;
