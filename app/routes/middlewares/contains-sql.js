const querystring = require('querystring');
const url = require('url');

const logger = require('../../config/logger')(__filename);

// eslint-disable-next-line no-control-regex
const emailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

function hasSql(value) {
  // NOTE: SQL RegEx reference:
  // http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
  const sqlMeta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i');
  const sqlMetaModified = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i'); // eslint-disable-line no-control-regex
  const sqlTypical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i');
  const sqlUnion = new RegExp('((%27)|(\'))union', 'i');

  if (value === null || value === undefined || !value) {
    return false;
  }

  if (
    sqlMeta.test(value)
    || sqlMetaModified.test(value)
    || sqlTypical.test(value)
    || sqlUnion.test(value)) {
    return true;
  }

  return false;
}

function containsSQLMiddleware(request, response, next) {
  let containsSql = false;
  let hasValidEmail = false;
  const isValidUrl = request.originalUrl !== null && request.originalUrl !== undefined;

  if (isValidUrl) {
    containsSql = hasSql(request.originalUrl);
    // NOTE: Some email address queries showed up as containing SQL, so let's allow these requests
    const parsedUrl = url.parse(request.originalUrl);
    const parsedQueryString = querystring.parse(parsedUrl.query);
    const { email } = parsedQueryString;

    hasValidEmail = email && emailRegex.test(decodeURI(email));
  }

  if (containsSql && !hasValidEmail) {
    logger.error(`${request.method} - ${request.url} - SQL Injection attack detected`);
    response.status(403).json({ error: 'Unauthorized' });
  } else {
    next();
  }
}

module.exports = containsSQLMiddleware;
