// local imports
const logger = require('../config/logger')(__filename);

function argsBuilder({ body, assignment = '', index }) {
  let args = '';
  let columns = '';
  let value = '';
  let values = [];

  if (body) {
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        args += args ? ', ' : '';

        if (!assignment) {
          columns += columns ? ', ' : '';
          // columns => name, age
          columns += key;
        }

        if (!assignment && body[key] === null) { // null values
          value = JSON.stringify(body[key]).toUpperCase();
          args += value;
        } else if (!assignment && typeof body[key] === 'object') { // objects as values
          values.push(`${JSON.stringify(body[key])}`);
          args += `$${index}`;
          index = index + 1;
        } else if (!assignment) { // strings && number values
          values.push(body[key]);
          args += `$${index}`;
          index = index + 1;
        }

        if (assignment && body[key] === null) { // null values
          value = `${key}${assignment}${JSON.stringify(body[key]).toUpperCase()}`;
          args += value;
        } else if (assignment && typeof body[key] === 'object') {
          values.push(`${JSON.stringify(body[key])}`);
          args += `${key}${assignment}$${index}`;
          index += 1;
        } else if (assignment) { // strings && number values
          values.push(body[key]);
          args += `${key}${assignment}$${index}`;
          index = index + 1;
        }
      }
    }
  }

  if (assignment === '=>') {
    args = args ? `(${args})` : args;
    return { args, values, index };
  }

  if (!assignment) {
    return { 'columns': `(${columns})`, 'args': `(${args})`, values, index };
  }
  return { args, values, index };
}

function queryParamsBuilder({ queryParams, index, name = '', body = '', args = '' }) {
  let error = false;
  let filters = '';
  let indexes = '';
  let text = '';
  let values = [];

  queryParams = queryParams.replace(/,&/g, ';%20AND%20');
  queryParams = queryParams.replace(/&/g, ';&');
  queryParams = queryParams.split(';');
  queryParams.map((params) => {
    params = params.replace('=', ' ');
    params = params.replace('.', ' ');
    params = params.split(' ');
    let [field = '', filter = '', value = ''] = params;
    let isNull = false;
    let placeholders = '';

    if (!filter) {
      error = true;
      return;
    }

    if (isNaN(value) && value === 'null') {
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
      value = value.replace('%28', '');
      value = value.replace('%29', '');
      value = value.replace(/%20/g, ' ');
      value = value.split(',');
      value = value.map(val => val.trim());
      indexes = value.map((val) => {
        val = `$${index}`;
        index += 1;
        return val;
      });
      indexes = `${indexes.join(', ')}`;
      indexes = `(${indexes})`;
    }

    if (!value) {
      filter = filter.replace(/,/g, ' ');
      filter = filter.trim();
      filter = filter.replace(/ /g, ', ');
      text = `${field} ${filter} FROM ${name}${args}`;
    } else if (text) {
      values = values.concat(value);
      value = indexes || `$${index}`;
      text += text.includes('WHERE') ? `${field} ${filter} ${value}` : ` WHERE ${field} ${filter} ${value}`;
      index += 1;
    } else if (value && !isNull) {
      values.push(value);
      filters += `${field} ${filter} $${index}`;
      index += 1;
    } else {
      filters += `${field} ${filter} ${value}`;
    }
  });

  text = text.replace(/%20/g, ' ');
  text = text.replace('&', '');
  text = text ? `${text}` : text;
  filters = filters.replace(/%20/g, ' ');
  values = values.map(val => String(val).replace(/%20/g, ' '));

  if (error) {
    text = '';
  }
  return { text, filters, values };
}

// version 1 Creates a parameterized query object
function parameterizedQueryBuilder({ name, method, body = '', prefer = '', queryParams = '' }) {
  const returning = prefer ? ' RETURNING *' : '';
  let assignment = '';
  let data;
  let index = 1;
  let newData = '';
  let queryString = '';
  let text = '';
  let values = [];

  if (!body && !queryParams) {
    text = `SELECT * FROM ${name}`;
    return { text, values };
  }

  if (method === 'get') {
    // GET requests
    data = queryParamsBuilder({ queryParams, index, name, body });
    text = data.filters ? `SELECT * FROM ${name} WHERE ${data.filters}` : data.text;
    values = data.values;
  } else if (method === 'post') {
    // POST requests
    let rowArgs = '';

    if (Array.isArray(body)) {
      body.map((item) => {
        newData = argsBuilder({ 'body': item, index });
        index = newData.index;
        rowArgs += rowArgs ? ',' : '';
        rowArgs += newData.args ? newData.args : '';
        values = values.concat(newData.values);
      });
    } else {
      newData = argsBuilder({ body, index });
      rowArgs = newData.args;
      values = newData.values;
    }

    text = `INSERT INTO ${name} ${newData.columns} VALUES ${rowArgs}${returning}`;
  } else if (method === 'post-rpc') {
    // POST requests to view_function()
    assignment = '=>';
    newData = argsBuilder({ body, assignment, index });
    index = newData.index;
    data = queryParamsBuilder({ queryParams, index, name, 'args': newData.args });
    text = queryParams ? `${data.text}` : `SELECT * FROM ${name}${newData.args}`;
    values = newData.values.concat(data.values);
  } else if (method === 'update') {
    // UPDATE requests
    assignment = '=';
    newData = argsBuilder({ body, assignment, index });
    index = newData.index;
    data = queryParamsBuilder({ queryParams, index });
    text = `UPDATE ${name} SET ${newData.args} WHERE ${data.filters}${returning}`;
    values = newData.values.concat(data.values);
  } else if (method === 'delete') {
    // DELETE requests
    data = queryParamsBuilder({ queryParams, index });
    text = `DELETE FROM ${name} WHERE ${data.filters}`;
    values = data.values;
  }
  return { text, values };
}

// isPositiveInteger is a function that takes a number
// as a string and checks if that number is a positive integer
//
// params stringValue: a String
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

module.exports = {
  parameterizedQueryBuilder,
  selectQueryBuilderV2,
};
