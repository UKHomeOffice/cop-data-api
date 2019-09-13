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

function columnsAndRowsBuilder(data, index) {
  let columns = '';
  let params = '';
  let values = [];

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      columns += columns ? ', ' : '';
      columns += key;
      params += params ? ', ' : '';

      if (data[key] === null) { // null values
        params += JSON.stringify(data[key]).toUpperCase();
      } else if (typeof data[key] === 'object') { // objects as values
        values.push(`'${JSON.stringify(data[key])}'`);
        params += `$${index}`;
        index = index + 1;
      } else { // strings && number values
        values.push(data[key]);
        params += `$${index}`;
        index = index + 1;
      }
    }
  }
  return { columns, params, values, index };
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

// version2 Creates a SELECT querystring
function selectQueryBuilderV2({ name, queryParams }) {
  let conditions = '';
  let index = 1;
  let limit = '';
  let order = '';
  let queryString = '';
  let select = '';
  let values = [];

  // check if select and limit are arrays
  if ((queryParams.select || queryParams.limit)
      && (Array.isArray(queryParams.select) || Array.isArray(queryParams.limit))) {
    return { queryString, values };
  }

  // check if limit is not integer
  // check if limit is a negative integer
  if (queryParams.limit && !isPositiveInteger(queryParams.limit)) {
    return { queryString, values };
  }

  if (queryParams.select) {
    select = `SELECT ${queryParams.select} FROM ${name}`;
  } else {
    select = `SELECT * FROM ${name}`;
  }

  if (queryParams.limit) {
    limit = ` LIMIT ${queryParams.limit}`;
  }

  if (queryParams.sort) {
    // 'name.asc,age.desc' -> ['name.asc', 'age.desc']
    let sortParams = queryParams.sort.split(',');
    sortParams.map((params) => {
      // 'name|asc' -> ['name', 'asc']
      params = params.replace('.', '|').split('|');
      let [field, filter] = params;
      filter = filter.toUpperCase();
      // unfortunately parameters are not supported in `ORDER BY`, `IS`, `IS NOT`, `GROUP`
      order += order.includes('ORDER BY') ? `, ${field} ${filter}` : ` ORDER BY ${field} ${filter}`;
    });
  }

  if (queryParams.filter) {
    queryParams.filter.map((params) => {
      // 'id=eq.3' -> ['id', 'eq' '3']
      params = params.replace('=', '|').replace('.', '|').split('|');
      let [field, filter, value] = params;
      let isNull = false;

      if (isNaN(value) && value === 'null') {
        isNull = true;
        value = value.toUpperCase();
      }

      if (filter === 'eq' && !isNull) {
        // 'continent = \'Asia\''
        filter = '=';
      } else if (filter === 'eq' && isNull) {
        // 'validfrom IS NULL'
        filter = 'IS';
      } else if (filter === 'neq' && !isNull) {
        // 'continent != \'Asia\''
        filter = '!=';
      } else if (filter === 'neq' && isNull) {
        // 'validfrom IS NOT NULL'
        filter = 'IS NOT';
      }

      // unfortunately parameters are not supported in `ORDER BY`, `IS`, `IS NOT`, `GROUP`
      if (!isNull) {
        values.push(value);
        value = `$${index}`;
        index = index + 1;
      }

      conditions += conditions.includes('WHERE') ? ` AND ${field} ${filter} ${value}` : ` WHERE ${field} ${filter} ${value}`;
    });
  }

  queryString = `${select}${conditions}${order}${limit}`;
  return { queryString, values };
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

// Creates a INSERT INTO querystring
function insertQueryBuilder({ name, body, prefer = '' }) {
  let columns = '';
  let index = 1;
  let rowValues = '';
  let values = [];
  const returning = prefer ? ' RETURNING *' : '';

  if (Array.isArray(body)) {
    body.map((data) => {
      const dataObject = columnsAndRowsBuilder(data, index);
      columns = `(${dataObject.columns})`;
      index = dataObject.index;
      rowValues += rowValues ? ',' : '';
      rowValues += dataObject.params ? `(${dataObject.params})` : '';
      values = values.concat(dataObject.values);
    });
  } else {
    const dataObject = columnsAndRowsBuilder(body, index);
    columns = `(${dataObject.columns})`;
    rowValues = `(${dataObject.params})`;
    values = values.concat(dataObject.values);
  }

  return {
    'queryString': `INSERT INTO ${name} ${columns} VALUES ${rowValues}${returning}`,
    values,
  };
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
  insertQueryBuilder,
  selectQueryBuilder,
  selectQueryBuilderV2,
  updateQueryBuilder,
};
