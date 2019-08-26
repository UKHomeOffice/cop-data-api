const {
  INSERT_QUERY,
  SELECT_QUERY,
  OP_EQUALS,
  OP_GT,
  OP_GTE,
  OP_IN,
  OP_LT,
  OP_LTE,
  OP_IS,
} = require('./ast');

const arrayToString = array => (Array.isArray(array) ? JSON.stringify(array) : array);

const generateTuple = tuple => `('${tuple.map(arrayToString).join("', '")}')`;

const quoteStringParam = param => (isNaN(param) ? `'${param}'` : param);

const generateColumns = ast => ast.columns.join(', ');

const generateValues = (ast) => {
  if (ast.data.length === 0) {
    throw new TypeError('Must have at least one data row for insert');
  }
  const values = ast.data.map(generateTuple);

  return `VALUES ${values.join(', ')}`;
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

const generateCode = (ast) => {
  switch (ast.type) {
    case SELECT_QUERY:
      return generateSelect(ast);
    case INSERT_QUERY:
      return generateInsert(ast);
    default:
      throw new TypeError(`Query type ${ast.type} not yet supported`);
  }
};

module.exports = { generateCode };
