const logger = require('../../config/logger')(__filename);
const {
  getEmailFromRequest,
  isEmailValid,
} = require('../../utils/email');
const hasSql = require('../../utils/has-sql');

function containsSQLMiddleware(request, response, next) {
  if (request.originalUrl === null || request.originalUrl === undefined) {
    next();
  } else {
    const email = getEmailFromRequest(request);

    // NOTE: Some email address queries showed up as containing SQL, so let's allow these requests
    if (hasSql(request.originalUrl) && !isEmailValid(email)) {
      logger.error(`${request.method} - ${request.url} - SQL Injection detected`);
      response.status(403).json({ error: 'Unauthorized' });
    } else {
      next();
    }
  }
}

module.exports = containsSQLMiddleware;
