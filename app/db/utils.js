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

function insertIntoStringBuilder(body='') {
  let insertIntoStr = '';
  let columns = '';
  let values = '';

  if (body) {
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
    insertIntoStr = `(${columns}) VALUES (${values})`;
  }
  return insertIntoStr;
}

function updateStringBuilder(body='') {
  let updateStr = '';

  if (body) {
    for (const key in body) {
      updateStr += updateStr ? ',' : '';

      if (typeof(body[key]) === 'object') {
        updateStr += `${key}=${JSON.stringify(body[key])}`;
      } else {
        updateStr += `${key}='${body[key]}'`;
      }
    }
  }
  return updateStr;
}

function queryBuilder(name, { id='', queryParams='', body='', method='', prefer='' }) {
  let args = '';
  let columnsAndValues = '';
  let query = '';
  const returning = prefer ? '%20RETURNING *' : '';

  if (!body && !queryParams) {
    query = `SELECT * FROM ${name}`;
  } else if (body && method === 'POST') {
    columnsAndValues = insertIntoStringBuilder(body);
    query = `INSERT INTO ${name} ${columnsAndValues}${returning}`;
  } else if (body && method === 'PATCH') {
    updateStr = updateStringBuilder(body);
    query = `UPDATE ${name} SET ${updateStr} WHERE id=id${returning}`;
  } else if (body && !queryParams) {
    args = viewFunctionArgsBuilder(body);
    query = `SELECT * FROM ${name}${args}`;
  } else {
    logger.info(`Query parameters received '${queryParams}'`);

    queryParams = queryParams.replace(/,&/g, ';AND%20');
    queryParams = queryParams.replace(/&/g, ';&');
    queryParams = queryParams.split(';');
    queryParams.map((params) => {
      args = viewFunctionArgsBuilder(body);
      params = params.replace('=', ' ').replace('.', ' ').split(' ');
      let [field='', filter='', value=''] = params;
      let options = '';
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

      if (!method && field === 'select') {
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
          query += query.includes('WHERE') ? `%20${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
        } else if (method === 'DELETE') {
          query = `DELETE FROM ${name} WHERE ${field} ${filter} ${value}`
        } else {
          query = `SELECT * FROM ${name} WHERE ${field} ${filter} ${value}`
        }
      }
    });
  }

  query = query.replace(/%20/g, ' ');
  query = query.replace('&', '');
  return query ? `${query};` : query;
}

module.exports = queryBuilder;
