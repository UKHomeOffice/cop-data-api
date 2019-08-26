
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

/*
 * Query Types
 */
const SELECT_QUERY = 'SELECT';
const INSERT_QUERY = 'INSERT';
const UPDATE_QUERY = 'UPDATE';
const DELETE_QUERY = 'DELETE';

/*
 * Object Types
 */
const TABLE = 'TABLE';
const FUNCTION = 'FUNCTION';

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
    this.arguments = [];
    this.returning = false;
  }

  addColumns(columns) {
    if (!columns) {
      throw new TypeError("Can't add a null or undefined column");
    }
    if (this.data.length > 0) {
      throw new TypeError("Can't add columns once data hase been added");
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

  addRow(data) {
    if (!data) {
      throw new TypeError("Can't add a null row of data");
    }
    const row = [];

    this.columns.forEach(c => row.push(data[c] || null));
    this.data.push(row);
  }

  addArguments(args) {
    if (this.objectType !== FUNCTION) {
      throw new TypeError(`Can only use arguments with FUNCTION objects. Object type is ${this.objectType}`);
    }

    this.arguments = Object.entries(args);
  }

  returnData() {
    if (this.type === UPDATE_QUERY || this.type === INSERT_QUERY) {
      this.returning = true;
    }
  }
}
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
  DELETE_QUERY,
  INSERT_QUERY,
  SELECT_QUERY,
  UPDATE_QUERY,
  FUNCTION,
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
