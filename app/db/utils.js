// local imports
const logger = require('../config/logger');

function viewFunctionArgsBuilder(body='') {
  let args = '';

  if (body) {
    for (const key in body) {
      args += args ? ',' : '';
      args += `${key}=>'${body[key]}'`;
    }
  }
  return args ? `(${args})` : args;
}

function insertIntoOptionsBuilder(body) {
  let columns = '';
  let values = '';

  for (const key in body) {
    columns += columns ? ',' : '';
    columns += key;
    values += values ? ',' : '';

    if (typeof(body[key]) === 'object') {
      values += `'${JSON.stringify(body[key])}'`
    } else {
      values += `'${body[key]}'`;
    }
  }
  return `(${columns}) VALUES (${values})`;
}

function queryParamsBuilder({ queryParams, body='', name='' }) {
  let options = '';
  let query = '';

  queryParams = queryParams.replace(/,&/g, ';%20AND%20');
  queryParams = queryParams.replace(/&/g, ';&');
  queryParams = queryParams.split(';');
  queryParams.map((params) => {
    args = viewFunctionArgsBuilder(body);
    params = params.replace('=', ' ').replace('.', ' ').split(' ');
    let [field='', filter='', value=''] = params;
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
    } else {
      if (query) {
        query += query.includes('WHERE') ? `${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
      } else {
        options += `${field} ${filter} ${value}`;
      }
    }
  });

  query = query.replace(/%20/g, ' ');
  query = query.replace('&', '');
  query = query ? `${query};` : query;
  options = options.replace(/%20/g, ' ');
  return { query, options };
}

// Creates a SELECT querystring
function selectQueryBuilder({ name, body='', queryParams='' }) {
  if (!body && !queryParams) {
    return `SELECT * FROM ${name};`;
  } else if (body && !queryParams) {
    const args = viewFunctionArgsBuilder(body);
    return `SELECT * FROM ${name}${args};`;
  } else {
    const { query, options } = queryParamsBuilder({ name, queryParams, body });
    return options ? `SELECT * FROM ${name} WHERE ${options};` : query;
  }
}

// Creates a INSERT INTO querystring
function insertIntoQueryBuilder({ name, body, prefer='' }) {
  const returning = prefer ? ' RETURNING *' : '';
  const options = insertIntoOptionsBuilder(body);
  return `INSERT INTO ${name} ${options}${returning};`;
}

// Creates an UPDATE querystring
function updateQueryBuilder({ name, body, id='', prefer='', queryParams='' }) {
  let values = '';
  const returning = prefer ? ' RETURNING *' : '';

  for (const key in body) {
    values += values ? ',' : '';

    if (typeof(body[key]) === 'object') {
      values += `${key}=${JSON.stringify(body[key])}`;
    } else {
      values += `${key}='${body[key]}'`;
    }
  }
  queryParams = id ? `id=eq.${id}` : queryParams;
  const { options } = queryParamsBuilder({ queryParams });
  return values ? `UPDATE ${name} SET ${values} WHERE ${options}${returning};` : '';
}

// Creates a DELETE querystring
function deleteQueryBuilder({ name, queryParams }) {
  const { options } = queryParamsBuilder({ queryParams });
  return `DELETE FROM ${name} WHERE ${options};`
}

module.exports = {
  deleteQueryBuilder,
  insertIntoQueryBuilder,
  selectQueryBuilder,
  updateQueryBuilder
};
