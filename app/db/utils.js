// local imports
const logger = require('../config/logger')(__filename);

function viewFunctionArgsBuilder(body = '') {
  let args = '';
  let value = '';

  if (body) {
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        args += args ? ',' : '';

        if (body[key] === null) { // null values
          value = JSON.stringify(body[key]).toUpperCase();
          args += `${key}=>${value}`;
        } else if (typeof body[key] === 'object') { // objects as values
          args += `${key}=>'${JSON.stringify(body[key])}'`;
        } else { // strings && number values
          args += `${key}=>'${body[key]}'`;
        }
      }
    }
  }
  return args ? `(${args})` : args;
}

function columnsAndRowsBuilder(data) {
  let columns = '';
  let values = '';

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      columns += columns ? ',' : '';
      columns += key;
      values += values ? ',' : '';

      if (data[key] === null) { // null values
        values += JSON.stringify(data[key]).toUpperCase();
      } else if (typeof data[key] === 'object') { // objects as values
        values += `'${JSON.stringify(data[key])}'`;
      } else { // strings && number values
        values += `'${data[key]}'`;
      }
    }
  }
  return { columns, values };
}

function insertIntoOptionsBuilder(body) {
  let rowValues = '';
  let columns = '';
  let values = '';

  if (Array.isArray(body)) {
    body.map((data) => {
      const dataObj = columnsAndRowsBuilder(data);
      rowValues += rowValues ? ',' : '';
      rowValues += dataObj.values ? `(${dataObj.values})` : '';
      columns = `(${dataObj.columns})`;
    });

    return `${columns} VALUES ${rowValues}`;
  }
  const dataObj = columnsAndRowsBuilder(body);
  columns = `(${dataObj.columns})`;

  return `(${dataObj.columns}) VALUES (${dataObj.values})`;
}

function queryParamsBuilder({ queryParams, body = '', name = '' }) {
  let options = '';
  let query = '';

  queryParams = queryParams.replace(/,&/g, ';%20AND%20');
  queryParams = queryParams.replace(/&/g, ';&');
  queryParams = queryParams.split(';');
  queryParams.map((params) => {
    const args = viewFunctionArgsBuilder(body);
    params = params.replace('=', ' ').replace('.', ' ').split(' ');
    let [field = '', filter = '', value = ''] = params;
    let isNull = false;

    if (!filter) {
      return '';
    }

    if (filter !== 'in' && isNaN(value) && value !== 'null') {
      value = `'${value}'`;
    } else if (isNaN(value) && value === 'null') {
      isNull = true;
      value = value.toUpperCase();
    }

    if (field === 'select') {
      field = field.toUpperCase();
    } else if (filter === 'gt' && !isNull) {
      filter = '>';
    } else if (filter === 'gte' && !isNull) {
      filter = '>=';
    } else if (filter === 'lt' && !isNull) {
      filter = '<';
    } else if (filter === 'lte' && !isNull) {
      filter = '<=';
    } else if (filter === 'eq' && !isNull) {
      filter = '=';
    } else if (filter === 'eq' && isNull) {
      filter = 'IS';
    } else {
      filter = 'IN';
      value = value.replace('%28', '').replace('%29', '').replace(/%20/g, ' ');

      let values = value.split(',');
      value = values.map(val => val.trim());
      value = `'${value.join("', '")}'`;
      value = `(${value})`;
    }

    if (!value) {
      filter = filter.replace(/,/g, ' ');
      filter = filter.trim();
      filter = filter.replace(/ /g, ', ');
      query = `${field} ${filter} FROM ${name}${args}`;
    } else if (query) {
      query += query.includes('WHERE') ? `${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
    } else {
      options += `${field} ${filter} ${value}`;
    }
  });

  query = query.replace(/%20/g, ' ');
  query = query.replace('&', '');
  query = query ? `${query};` : query;
  options = options.replace(/%20/g, ' ');
  return { query, options };
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
  if (!body && !queryParams) {
    return `SELECT * FROM ${name};`;
  }

  if (body && !queryParams) {
    const args = viewFunctionArgsBuilder(body);
    return `SELECT * FROM ${name}${args};`;
  }

  const { query, options } = queryParamsBuilder({ name, queryParams, body });
  return options ? `SELECT * FROM ${name} WHERE ${options};` : query;
}

// version2 Creates a SELECT querystring
function selectQueryBuilderV2({ name, queryParams = '' }) {
  return queryParamsBuilderV2({ name, queryParams });
}

// Creates a INSERT INTO querystring
function insertIntoQueryBuilder({ name, body, prefer = '' }) {
  const returning = prefer ? ' RETURNING *' : '';
  const options = insertIntoOptionsBuilder(body);
  return `INSERT INTO ${name} ${options}${returning};`;
}

// Creates an UPDATE querystring
function updateQueryBuilder({ name, body, id = '', prefer = '', queryParams = '' }) {
  let value = '';
  let values = '';
  const returning = prefer ? ' RETURNING *' : '';

  for (const key in body) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      values += values ? ',' : '';

      if (body[key] === null) { // null values
        value = JSON.stringify(body[key]).toUpperCase();
        values += `${key}=${value}`;
      } else if (typeof body[key] === 'object') { // objects as values
        values += `${key}=${JSON.stringify(body[key])}`;
      } else { // strings && number values
        values += `${key}='${body[key]}'`;
      }
    }
  }
  queryParams = id ? `id=eq.${id}` : queryParams;
  const { options } = queryParamsBuilder({ queryParams });
  return values ? `UPDATE ${name} SET ${values} WHERE ${options}${returning};` : '';
}

// Creates a DELETE querystring
function deleteQueryBuilder({ name, queryParams }) {
  const { options } = queryParamsBuilder({ queryParams });
  return `DELETE FROM ${name} WHERE ${options};`;
}

module.exports = {
  deleteQueryBuilder,
  insertIntoQueryBuilder,
  selectQueryBuilder,
  selectQueryBuilderV2,
  updateQueryBuilder,
};
