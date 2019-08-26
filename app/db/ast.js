
class QueryFilter {
  constructor(fieldName, operator, operand) {
    if (!fieldName || !operator || !operand) {
      throw new TypeError(`Cannot construct QueryFilter without specifying "fieldName" (${fieldName}), "operator"(${operator})  and "operand" (${operand})`);
    }
    this.fieldName = fieldName;
    this.operator = operator;
    this.operand = operand;
  }
}

class AbstractSyntaxTree {
  constructor(type, objectName, objectType) {
    if (!type || !objectName || !objectType) {
      throw new TypeError(`Cannot construct AST without specifying "type" (${type}), "objectName"(${objectName})  and "objectType" (${objectType})`);
    }

    this.type = type;
    this.objectName = objectName;
    this.objectType = objectType;
    this.columns = [];
    this.data = [];
    this.filter = [];
    this.returning = [];
  }

  addColumns(columns) {
    if (!columns) {
      throw new TypeError("Can't add a null or undefined column");
    }
    if (!Array.isArray(columns)) {
      this.columns.push(columns);
    } else {
      this.columns.push(...columns.filter(c => c));
    }
  }

  addFilter(fieldName, operator, operand) {
    this.filter.push(new QueryFilter(fieldName, operator, operand));
  }
}

/*
 * Query Types
 */
const SELECT_QUERY = 'SELECT';

/*
 * Object Types
 */
const TABLE = 'TABLE';

/*
 * Filter operators
 */
const OP_EQUALS = 'EQ';
const OP_GT = 'GT';
const OP_GTE = 'GTE';
const OP_IN = 'IN';
const OP_IS = 'IS';
const OP_LT = 'LT';
const OP_LTE = 'LTE';

const NULL = 'NULL';

module.exports = {
  AbstractSyntaxTree,
  SELECT_QUERY,
  TABLE,
  OP_EQUALS,
  OP_GT,
  OP_GTE,
  OP_IN,
  OP_IS,
  OP_LT,
  OP_LTE,
  NULL,
};
