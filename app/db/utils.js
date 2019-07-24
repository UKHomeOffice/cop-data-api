// local imports
const logger = require('../config/logger');

function argsBuilder(body='') {
  let args = '';

  if (body) {
    for (const key in body) {
      args += args ? ',' : '';
      args += `${key}=>'${body[key]}'`;
    }
  }
  return args ? `(${args})` : args;
}

function queryBuilder(name, { queryParams='', body='', method='' }) {
  let args = '';
  let query ='';

  if (!body && !queryParams) {
    query = `SELECT * FROM ${name}`;
  } else if(body && !queryParams) {
    args = argsBuilder(body);
    query = `SELECT * FROM ${name}${args}`;
  } else {
    logger.info(`Query parameters received '${queryParams}'`);

    queryParams = queryParams.replace(/,&/g, ';AND%20');
    queryParams = queryParams.replace(/&/g, ';&');
    queryParams = queryParams.split(';');
    queryParams.map((params) => {
      args = argsBuilder(body);
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
      } else if (filter === 'neq' && !isNull) {
        filter = '!=';
      } else if (filter === 'neq' && isNull) {
        filter = 'IS NOT';
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
