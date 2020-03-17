const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

// local imports

const authMiddleware = require('./middlewares/auth');
const containsSQLMiddleware = require('./middlewares/contains-sql');
const logger = require('../config/logger')(__filename);
const v1 = require('./v1');
const v2 = require('./v2');

const corsConfiguration = {
  origin: '*',
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

app.use(cors(corsConfiguration));
// extended: true allows the values of the objects passed, to be of any type
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.options('*', cors(corsConfiguration));

// check each request for authorization token
app.use(authMiddleware);
app.use(containsSQLMiddleware);

app.use('/v1', v1);
app.use('/v2', v2);
app.get('/_health', (req, res) => {
  logger.silly('API is Alive & Kicking!');

  return res.status(200).json({ status: 'UP' });
});

module.exports = app;
