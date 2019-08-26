const {
  SELECT_QUERY,
  OP_EQUALS,
  OP_GT,
  OP_GTE,
  OP_IN,
  OP_LT,
  OP_LTE,
  OP_IS,
} = require('./ast');

const generateTuple = tuple => `('${tuple.join("', '")}')`;

const quoteStringParam = param => (isNaN(param) ? `'${param}'` : param);

const generateColumns = ast => ast.columns.join(', ');

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

const generateCode = (ast) => {
  switch (ast.type) {
    case SELECT_QUERY:
      return generateSelect(ast);
    default:
      throw new TypeError(`Query type ${ast.type} not yet supported`);
  }
};

module.exports = { generateCode };
