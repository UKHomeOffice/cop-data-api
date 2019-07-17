const bodyParser = require('body-parser');
const express = require('express');
const jwtDecode = require('jwt-decode');
const moment = require('moment');

// local imports
const get = require('../db/get');
const logger = require('../config/logger');
const queryBuilder = require('../db/utils');

const app = express();

app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
// check each request for authorization token
app.use((req, res, next) => {
  if (req.headers.authorization) {
    // decode the keycloak jwt token
    const token = jwtDecode(req.headers.authorization);
    const tokenExpiryDate = moment(token.exp * 1000);
    const currentDate = moment(new Date());

    // check if the token expiry time is in the future
    if (currentDate.unix() < tokenExpiryDate.unix()) {
      logger.info(`${req.method} - ${req.url} - Request by ${token.name}, ${token.email} - Token valid until - ${tokenExpiryDate.format()}`);
      res.locals.user = token;
      // process request
      next();
    } else {
      logger.error(`${req.method} - ${req.url} - Request by ${token.name}, ${token.email} - Unauthorized - Token expired at ${tokenExpiryDate.format()}`);
      res.status(401).json({ 'error': 'Unauthorized' });
    }
  } else {
    // don't process the request further
    res.status(401).json({ 'error': 'Unauthorized' });
  }
});

app.get('/v1/:name', (req, res) => {
  const { name } = req.params;
  const { dbrole } = res.locals.user;
  const queryParams = req.url.split('?')[1];
  const query = queryBuilder(name, queryParams);

  if (!query) {
    return res.status(400).json({ 'error': 'Invalid query parameters' })
  }

  const data = get(dbrole, name, query);
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
