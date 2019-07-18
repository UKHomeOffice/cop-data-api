function queryBuilder(name, queryParams='') {
  if (queryParams) {
    let query ='';
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
      }

      if (!value) {
        filter = filter.replace(/,/g, ' ');
        filter = filter.trim();
        filter = filter.replace(/ /g, ', ');
        query += `${field} ${filter} FROM ${name};`;
      } else {
        options += `${field} ${filter} ${value}`;
        options = options.replace(/%20/g, ' ');
        query = `SELECT * FROM ${name} WHERE ${options};`
      }
    });
    return query;
  }
  return `SELECT * FROM ${name};`;
}

module.exports = queryBuilder;
