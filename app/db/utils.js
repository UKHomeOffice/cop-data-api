// local imports
const logger = require('../config/logger')(__filename);

function argsBuilderFunctionStatement(body, index) {
  let args = '';
  let values = [];
  // default to 1 if index is not passed
  index = index ? index : 1;

  if (body) {
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        args += args ? ', ' : '';

        if (body[key] === null) { // null values
          // args => name=>NULL
          args += `${key}=>${JSON.stringify(body[key]).toUpperCase()}`;
        } else if (typeof body[key] === 'object') { // objects as values
          // values => ['Yuri', '34']
          values.push(`${JSON.stringify(body[key])}`);
          args += `${key}=>$${index}`;
          index += 1;
        } else { // strings && number values
          values.push(body[key]);
          // args => name=>$1, address=>$2
          args += `${key}=>$${index}`;
          index = index + 1;
        }
      }
    }
  }
  args = args ? `(${args})` : args;
  return { args, values, index };
}

function argsBuilderUpdateStatement(body, index) {
  let args = '';
  let values = [];
  // default to 1 if index is not passed
  index = index ? index : 1;

  if (body) {
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        args += args ? ', ' : '';

        if (body[key] === null) { // null values
          // args => name=NULL
          args += `${key}=${JSON.stringify(body[key]).toUpperCase()}`;
        } else if (typeof body[key] === 'object') { // objects as values
          // values => ['Yuri', 34]
          values.push(`${JSON.stringify(body[key])}`);
          args += `${key}=$${index}`;
          index = index + 1;
        } else { // strings && number values
          values.push(body[key]);
          // args => name=$1, address=$2
          args += `${key}=$${index}`;
          index = index + 1;
        }
      }
    }
  }
  return { args, values, index };
}

function columnsAndRowsBuilder(data, index) {
  let columns = '';
  let params = '';
  let values = [];

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      columns += columns ? ', ' : '';
      // columns => name, age
      columns += key;
      params += params ? ', ' : '';

      if (data[key] === null) { // null values
        params += JSON.stringify(data[key]).toUpperCase();
      } else if (typeof data[key] === 'object') { // objects as values
        // values => ['Yuri', 34]
        values.push(`${JSON.stringify(data[key])}`);
        params += `$${index}`;
        index = index + 1;
      } else { // strings && number values
        values.push(data[key]);
        // params => $1, $2
        params += `$${index}`;
        index = index + 1;
      }
    }
  }
  return { columns, params, values, index };
}

function queryParamsBuilder({ queryParams, method, body = '', name = '' }) {
  let args = '';
  let values = [];
  let error = false;
  let index = 1;
  let options = '';
  let params = '';
  let query = '';


  if (method === 'VIEW_FUNCTION') {
    const obj = argsBuilderFunctionStatement(body, index);
    args = obj.args;
    values = values.concat(obj.values);
    index = obj.index ? obj.index : index;
  } else if (method === 'UPDATE') {
    const obj = argsBuilderUpdateStatement(body, index);
    args = obj.args;
    values = values.concat(obj.values);
    index = obj.index ? obj.index : index;
  }

  queryParams = queryParams.replace(/,&/g, ';%20AND%20');
  queryParams = queryParams.replace(/&/g, ';&');
  queryParams = queryParams.split(';');
  queryParams.map((params) => {
    params = params.replace('=', ' ').replace('.', ' ').split(' ');
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

      // receives value '%28122,222%29'
      let items = value.replace('%28', '')
      items = items.replace('%29', '')
      items = items.replace(/%20/g, ' ');
      items = items.split(',');

      // assign items ['122', '222'] to value
      value = items.map(val => val.trim());

      // convert items ['122', '222'] to
      // indexed placeholders ($1, $2)
      placeholders = items.map(val => {
        val = `$${index}`;
        index = index + 1;
        return val;
      })
      placeholders = `${placeholders.join(", ")}`;
      placeholders = `(${placeholders})`;
    }

    if (!value) {
      filter = filter.replace(/,/g, ' ');
      filter = filter.trim();
      filter = filter.replace(/ /g, ', ');
      query = `${field} ${filter} FROM ${name}${args}`;
    } else if (query) {
      values = values.concat(value);
      value = placeholders ? placeholders : `$${index}`;
      query += query.includes('WHERE') ? `${field} ${filter} ${value}` : `%20WHERE ${field} ${filter} ${value}`;
      index = index + 1;
    } else if (value && !isNull) {
      values.push(value);
      options += `${field} ${filter} $${index}`;
      index = index + 1;
    } else {
      options += `${field} ${filter} ${value}`;
    }
  });

  query = query.replace(/%20/g, ' ');
  query = query.replace('&', '');
  query = query ? `${query}` : query;
  options = options.replace(/%20/g, ' ');
  values = values.map(val => String(val).replace(/%20/g, ' '));

  if (error) {
    query = ''
  }
  return { query, args, options, values };
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

// version1 Creates a SELECT querystring
function selectQueryBuilder({ name, body = '', queryParams = '' }) {
  let queryString = '';

  if (!body && !queryParams) {
    return {
      'queryString': `SELECT * FROM ${name}`,
      'values': [],
    };
  }


  if (body && !queryParams) {
    const { args, values } = argsBuilderFunctionStatement(body);

    queryString = `SELECT * FROM ${name}${args}`;
    return { queryString, values };
  }

  const method = 'VIEW_FUNCTION';
  const { query, options, values } = queryParamsBuilder({ name, method, queryParams, body });
  queryString = options ? `SELECT * FROM ${name} WHERE ${options}` : query;
  return { queryString, values };
}

// Creates a INSERT INTO querystring
// insertQueryBuilder is a function that given array of objects
// or a single object, it manipulates its data in order to be used as
// a parameterized query, for example:
//
// * Array of Objects:
//    [
//      { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
//      { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
//    ]
//
//    Parameterized query data:
//
//    columns: (name, age, email)
//    rowValues: ($1, $2, $3),($4, $5, $6)
//    values: ['John', 34, 'john@mail.com', 'Rachel', 32, 'rachel@mail.com']
//
// * Object
//    { 'name': 'John', 'age': 34, 'email': 'john@mail.com' }
//
//    Parameterized query data:
//
//    columns: (name, age, email)
//    rowValues: ($1, $2, $3)
//    values: ['John', 34, 'john@mail.com']
//
// params name:   a String
// params body:   an Array or Object
// params prefer: a String
// returns:       an Object
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
  const queryString = `INSERT INTO ${name} ${columns} VALUES ${rowValues}${returning}`;
  return { queryString, values };
}

// Creates an UPDATE querystring
function updateQueryBuilder({ name, body, id = '', prefer = '', queryParams = '' }) {
  if (!Array.isArray(body)) {
    queryParams = id ? `id=eq.${id}`: queryParams;

    const method = 'UPDATE';
    const returning = prefer ? ' RETURNING *' : '';
    const { args, options, values } = queryParamsBuilder({ queryParams, method, body });
    const queryString = `UPDATE ${name} SET ${args} WHERE ${options}${returning}`;
    return { queryString, values };
  }
}

// Creates a DELETE querystring
function deleteQueryBuilder({ name, queryParams }) {
  const { options, values } = queryParamsBuilder({ queryParams });
  const queryString = `DELETE FROM ${name} WHERE ${options}`;
  return { queryString, values };
}

module.exports = {
  deleteQueryBuilder,
  insertQueryBuilder,
  selectQueryBuilder,
  selectQueryBuilderV2,
  updateQueryBuilder,
};
