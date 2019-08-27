// local imports
const logger = require('../config/logger')(__filename);
const {
  AbstractSyntaxTree,
  SELECT_QUERY,
  INSERT_QUERY,
  UPDATE_QUERY,
  DELETE_QUERY,
  OP_EQUALS,
  OP_GT,
  OP_GTE,
  OP_IN,
  OP_IS,
  OP_LT,
  OP_LTE,
  TABLE,
  FUNCTION,
  NULL,
} = require('./ast');

const { generateCode } = require('./codegen');

function insertIntoOptionsBuilder(body, ast) {
  if (Array.isArray(body)) {
    ast.addColumns(Object.keys(body[0]));
    body.forEach(row => ast.addRow(row));
  } else {
    ast.addColumns(Object.keys(body));
    ast.addRow(body);
  }
}

function queryParamsBuilder({ queryParams }, ast) {
  queryParams = queryParams.split('&');
  queryParams.map((params) => {
    if (!params) {
      return;
    }
    const [paramName, paramValue] = params.split('=');
    if (paramName === 'select') {
      if (!paramValue) {
        throw new TypeError('Select clause specified with no columns');
      }
      ast.addColumns(paramValue.split(','));
    } else {
      const field = paramName;
      let [filter = '', value = ''] = paramValue.split(/\.(.+)/);

      if (value === 'null') {
        if (filter !== 'eq') {
          throw new TypeError('NULL value is only valid for "eq" operator"');
        }
        ast.addFilter(field, OP_IS, NULL);
        return;
      }
      value = decodeURIComponent(value.replace(/\+/g, '%20'));

      switch (filter) {
        case 'gt':
          value = value.replace(',', '');
          ast.addFilter(field, OP_GT, value);
          break;
        case 'gte':
          value = value.replace(',', '');
          ast.addFilter(field, OP_GTE, value);
          break;
        case 'lt':
          value = value.replace(',', '');
          ast.addFilter(field, OP_LT, value);
          break;
        case 'lte':
          value = value.replace(',', '');
          ast.addFilter(field, OP_LTE, value);
          break;
        case 'eq':
          value = value.replace(',', '');
          ast.addFilter(field, OP_EQUALS, value);
          break;
        case 'in':
          value = value.replace('(', '').replace(')', '');
          ast.addFilter(field, OP_IN, value.split(',').map(val => val.trim()));
          break;
        default:
          throw new TypeError(`Unkown filter ${filter}`);
      }
    }
  });
}

// isPositiveInteger is a function that takes a number
// as a string and checks if that number is a positive integer
//
// params stringValue: a string
// returns:            a Boolean
function isPositiveInteger(stringValue) {
  const number = Math.floor(Number(stringValue));
  return number !== Infinity && String(number) === stringValue && number >= 0;
}

function queryParamsBuilderV2({ name, queryParams }) {
  let conditions = '';
  let limit = '';
  let order = '';
  let select = '';

  // check if select and limit are arrays
  if ((queryParams.select || queryParams.limit)
      && (Array.isArray(queryParams.select) || Array.isArray(queryParams.limit))) {
    return '';
  }

  // check if limit is not integer
  // check if limit is a negative integer
  if (queryParams.limit && !isPositiveInteger(queryParams.limit)) {
    return '';
  }

  if (queryParams.select) {
    select = `SELECT ${queryParams.select} FROM ${name}`;
  } else {
    select = `SELECT * FROM ${name}`;
  }

  if (queryParams.limit) {
    limit = `%20LIMIT ${queryParams.limit}`;
  }

  if (queryParams.filter) {
    queryParams.filter.map((params) => {
      // 'id=eq.3' -> ['id', 'eq' '3']
      params = params.replace('=', '|').replace('.', '|').split('|');
      let [field, filter, value] = params;
      let isNull = false;

      if (filter !== 'in' && isNaN(value) && value !== 'null') {
        value = `'${value}'`;
      } else if (isNaN(value) && value === 'null') {
        isNull = true;
        value = value.toUpperCase();
      }

      if (filter === 'eq' && !isNull) {
        // 'continent = \'Asia\''
        filter = '=';
      } else if (filter === 'eq' && isNull) {
        // 'validfrom IS NULL'
        filter = 'IS';
      }

      conditions += conditions.includes('WHERE') ? `%20AND ${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
    });
  }

  let query = `${select}${conditions}${order}${limit};`;
  query = query.replace(/%20/g, ' ');
  return query;
}

// version1 Creates a SELECT querystring
function selectQueryBuilder({ name, body = '', queryParams = '' }) {
  const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);

  queryParamsBuilder({ queryParams }, ast);

  return generateCode(ast);
}

function functionQueryBuilder({ name, body = '', queryParams = '' }) {
  const ast = new AbstractSyntaxTree(SELECT_QUERY, name, FUNCTION);
  ast.addArguments(body);

  queryParamsBuilder({ queryParams }, ast);

  return generateCode(ast);
}

// version2 Creates a SELECT querystring
function selectQueryBuilderV2({ name, queryParams = '' }) {
  return queryParamsBuilderV2({ name, queryParams });
}

// Creates a INSERT INTO querystring
function insertIntoQueryBuilder({ name, body, prefer = '' }) {
  const ast = new AbstractSyntaxTree(INSERT_QUERY, name, TABLE);
  const returning = prefer ? ' RETURNING *' : '';

  if (returning) {
    ast.returnData();
  }
  insertIntoOptionsBuilder(body, ast);
  return generateCode(ast);
}

// Creates an UPDATE querystring
function updateQueryBuilder({ name, body, id = '', prefer = '', queryParams = '' }) {
  const ast = new AbstractSyntaxTree(UPDATE_QUERY, name, TABLE);
  if (prefer) {
    ast.returnData();
  }
  ast.addColumns(Object.keys(body));
  ast.addRow(body);

  if (id) {
    ast.addFilter('id', OP_EQUALS, id);
  } else {
    queryParamsBuilder({ queryParams }, ast);
  }
  return generateCode(ast);
}

// Creates a DELETE querystring
function deleteQueryBuilder({ name, queryParams }) {
  const ast = new AbstractSyntaxTree(DELETE_QUERY, name, TABLE);
  queryParamsBuilder({ queryParams }, ast);
  return generateCode(ast);
}

module.exports = {
  deleteQueryBuilder,
  functionQueryBuilder,
  insertIntoQueryBuilder,
  selectQueryBuilder,
  selectQueryBuilderV2,
  updateQueryBuilder,
};
