function queryBuilder(name, queryParams='') {
  if (queryParams) {
    let query ='';
    queryParams = queryParams.replace(/&/g, ';&');
    queryParams = queryParams.split(';');
    queryParams.map((params) => {
      params = params.replace('=', ' ').split(' ');
      let [field='', filter='', value=''] = params;

      if (field === 'select') {
        field = field.toUpperCase();
      }

      if (!filter) {
        query = '';
      } else if (!value) {
        filter = filter.replace(/,/g, ' ');
        filter = filter.trim();
        filter = filter.replace(/ /g, ', ');
        query += `${field} ${filter} FROM ${name};`;
      }
    });

    return query;
  }
  return `SELECT * FROM ${name};`;
}

module.exports = queryBuilder;
