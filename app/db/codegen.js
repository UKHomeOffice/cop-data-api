const {
  DELETE_QUERY,
  INSERT_QUERY,
  SELECT_QUERY,
  UPDATE_QUERY,
  OP_EQUALS,
  OP_GT,
  OP_GTE,
  OP_IN,
  OP_LT,
  OP_LTE,
  OP_IS,
  TABLE,
} = require('./ast');

const arrayToString = array => (Array.isArray(array) ? JSON.stringify(array) : array);

const generateTuple = tuple => `('${tuple.map(arrayToString).join("', '")}')`;

const quoteStringParam = param => (isNaN(param) ? `'${param}'` : param);
const quoteNonArrayParam = param => (!Array.isArray(param) ? `'${param}'` : param);

const generateColumns = ast => ast.columns.join(', ');

const generateArgs = ast => ast.arguments.map(([name, value]) => `${name}=>'${value}'`).join(', ');

const generateValues = (ast) => {
  if (ast.data.length === 0) {
    throw new TypeError('Must have at least one data row for insert');
  }
  const values = ast.data.map(generateTuple);

  return `VALUES ${values.join(', ')}`;
};

const generateFieldsToUpdate = (ast) => {
  if (ast.data.length !== 1) {
    throw new TypeError('Must have only one data row for update');
  }
  if (ast.columns.length === 0) {
    throw new TypeError('Must have at least one column to update');
  }

  const data = ast.data[0];
  return data.map(quoteNonArrayParam)
    .map((e, i) => [ast.columns[i], arrayToString(e)])
    .map(([name, value]) => `${name}=${value}`)
    .join(', ');
};

const generateWhere = (ast) => {
  const filters = ast.filter.map((filter) => {
    switch (filter.operator) {
      case OP_EQUALS:
        return `${filter.fieldName} = ${quoteStringParam(filter.operand)}`;
      case OP_GT:
        return `${filter.fieldName} > ${quoteStringParam(filter.operand)}`;
      case OP_GTE:
        return `${filter.fieldName} >= ${quoteStringParam(filter.operand)}`;
      case OP_IN:
        return `${filter.fieldName} IN ${generateTuple((filter.operand))}`;
      case OP_IS:
        return `${filter.fieldName} IS ${filter.operand}`;
      case OP_LT:
        return `${filter.fieldName} < ${quoteStringParam(filter.operand)}`;
      case OP_LTE:
        return `${filter.fieldName} <= ${quoteStringParam(filter.operand)}`;
      default:
        throw new TypeError(`Unimplmented operator ${filter.operator}`);
    }
  });

  if (filters.length !== 0) {
    return ` WHERE ${filters.join(' AND ')}`;
  }
  return '';
};

const generateSelect = (ast) => {
  const selectClause = generateColumns(ast) || '*';
  const whereClause = generateWhere(ast);

  return `SELECT ${selectClause} FROM ${ast.objectName}${whereClause};`;
};

const generateInsert = (ast) => {
  let columns = generateColumns(ast);
  columns = columns ? `(${columns})` : '';
  const values = generateValues(ast);
  const returning = ast.returning ? ' RETURNING *' : '';

  return `INSERT INTO ${ast.objectName} ${columns} ${values}${returning};`;
};

const generateUpdate = (ast) => {
  const fieldsToUpdate = generateFieldsToUpdate(ast);
  const whereClause = generateWhere(ast);
  const returning = ast.returning ? ' RETURNING *' : '';

  return `UPDATE ${ast.objectName} SET ${fieldsToUpdate}${whereClause}${returning};`;
};

const generateDelete = (ast) => {
  const whereClause = generateWhere(ast);

  return `DELETE FROM ${ast.objectName}${whereClause};`;
};

const generateFunctionCall = (ast) => {
  const selectClause = generateColumns(ast) || '*';
  const whereClause = generateWhere(ast);
  const args = generateArgs(ast);

  return `SELECT ${selectClause} FROM ${ast.objectName}(${args})${whereClause};`;
};

const generateCode = (ast) => {
  switch (ast.type) {
    case SELECT_QUERY:
      if (ast.objectType === TABLE) {
        return generateSelect(ast);
      }
      return generateFunctionCall(ast);
    case INSERT_QUERY:
      return generateInsert(ast);
    case UPDATE_QUERY:
      return generateUpdate(ast);
    case DELETE_QUERY:
      return generateDelete(ast);
    default:
      throw new TypeError(`Query type ${ast.type} not yet supported`);
  }
};

module.exports = { generateCode };
