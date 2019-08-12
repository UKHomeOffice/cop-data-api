// local imports
const logger = require('../config/logger')(__filename);

function viewFunctionArgsBuilder(body = '') {
  let args = '';

  if (body) {
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        args += args ? ',' : '';
        args += `${key}=>'${body[key]}'`;
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

      if (typeof data[key] === 'object') {
        values += `'${JSON.stringify(data[key])}'`;
      } else {
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

function queryParamsBuilderV2({ name, queryParams }) {
  let query = `SELECT * FROM ${name}`;

  for (const key in queryParams) {
    if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
      let cols = '';
      let field = '';
      let filter = '';
      let value = '';

      if ((key === 'select' || key === 'limit') && Array.isArray(queryParams[key])) {
        query = '';
        return query;
      }

      if (key === 'select') {
        field = key.toUpperCase();
        cols = queryParams[key];
        query = `${field} ${cols} FROM ${name}`;
      } else if (key === 'limit') {
        field = key.toUpperCase();
        value = queryParams[key];
        query += `%20${field} ${value}`;
      } else if (key === 'filter') {
        queryParams[key].map((params) => {
          let isNull = false;

          params = params.replace('=', '|').replace('.', '|').split('|');
          field = params[0];
          filter = params[1];
          value = params[2];

          if (filter !== 'in' && isNaN(value) && value !== 'null') {
            value = `'${value}'`;
          } else if (isNaN(value) && value === 'null') {
            isNull = true;
            value = value.toUpperCase();
          }

          if (filter === 'eq' && !isNull) {
            filter = '=';
          } else if (filter === 'eq' && isNull) {
            filter = 'IS';
          }

          if (query) {
            query += query.includes('WHERE') ? `%20AND ${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
          }
        });
      }
    }
  }

  query = query.replace(/%20/g, ' ');
  query = query ? `${query};` : query;
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
function selectQueryBuilderV2({ name, body = '', queryParams = '' }) {
  if (!body && Object.entries(queryParams).length === 0) {
    return `SELECT * FROM ${name};`;
  }

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
  let values = '';
  const returning = prefer ? ' RETURNING *' : '';

  for (const key in body) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      values += values ? ',' : '';

      if (typeof body[key] === 'object') {
        values += `${key}=${JSON.stringify(body[key])}`;
      } else {
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
