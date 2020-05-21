const querystring = require('querystring');
const url = require('url');

// eslint-disable-next-line no-control-regex
const emailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

const isEmailValid = email => email && emailRegex.test(decodeURI(email));

const getEmailFromRequest = (request) => {
  const parsedUrl = url.parse(request.originalUrl);

  return querystring.parse(parsedUrl.query).email || false;
};


module.exports = {
  isEmailValid,
  getEmailFromRequest,
};
