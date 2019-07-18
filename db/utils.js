// local imports
const logger = require('../config/logger');

function queryBuilder(name, queryParams='') {
  if (queryParams) {
    logger.info(`Query parameters received '${queryParams}'`);

    let query ='';
    queryParams = queryParams.replace(/,&/g, ';AND%20');
    queryParams = queryParams.replace(/&/g, ';&');
    queryParams = queryParams.split(';');
    queryParams.map((params) => {
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

      if (field === 'select') {
        field = field.toUpperCase();
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
        query += `${field} ${filter} FROM ${name}`;
      } else {
        if (query) {
          query += query.includes('WHERE') ? `%20${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
        } else {
          query = `SELECT * FROM ${name} WHERE ${field} ${filter} ${value}`
        }
      }
    });

    query = query.replace(/%20/g, ' ');
    query = query.replace('&', '');
    return query ? `${query};` : query;
  }
  return `SELECT * FROM ${name};`;
}

module.exports = queryBuilder;
