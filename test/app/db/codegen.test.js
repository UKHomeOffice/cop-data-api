const { expect } = require('chai');

// local imports
const {
  selectQueryBuilder,
  selectQueryBuilderV2,
  updateQueryBuilder,
} = require('../../../app/db/utils');

const {
  AbstractSyntaxTree,
  DELETE_QUERY,
  INSERT_QUERY,
  SELECT_QUERY,
  UPDATE_QUERY,
  OP_EQUALS,
  OP_GT,
  OP_GTE,
  OP_IN,
  OP_IS,
  OP_LT,
  OP_LTE,
  NULL,
  TABLE,
} = require('../../../app/db/ast');
const { generateCode } = require('../../../app/db/codegen');

describe('Test database utils', () => {
  describe('v1 GET - querystring builder', () => {
    it('Should return a querystring with two columns selected', () => {
      const name = 'roles';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addColumns(['developer', 'linemanager']);
      const expectedQuery = `SELECT developer, linemanager FROM ${name};`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with three columns selected', () => {
      const name = 'roles';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addColumns(['firstname', 'lastname', 'email']);
      const expectedQuery = `SELECT firstname, lastname, email FROM ${name};`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    xit('Should return an empty querystring if no filters are passed', () => {
      const name = 'roles';
      const queryParams = 'select=';
      const expectedQuery = '';
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data', () => {
      const name = 'users';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      const expectedQuery = `SELECT * FROM ${name};`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all team data where name matches team name', () => {
      const name = 'team';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addFilter('name', OP_EQUALS, 'Tilbury 2');
      const expectedQuery = `SELECT * FROM ${name} WHERE name = 'Tilbury 2';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    xit('Should return a querystring for all data where email matches user email', () => {
      const name = 'users';
      const queryParams = 'email=eq.john@mail.com';
      const expectedQuery = `SELECT * FROM ${name} WHERE email = 'john@mail.com';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where name is null', () => {
      const name = 'users';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addFilter('name', OP_IS, NULL);
      const expectedQuery = `SELECT * FROM ${name} WHERE name IS NULL;`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with a column selected filtering by an array', () => {
      const name = 'users';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addColumns('email');
      ast.addFilter('staffid', OP_IN, ['123', '222']);
      const expectedQuery = `SELECT email FROM ${name} WHERE staffid IN ('123', '222');`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with two columns selected filtering by an array', () => {
      const name = 'users';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addColumns(['email', 'name']);
      ast.addFilter('staffid', OP_IN, ['123', '222']);
      const expectedQuery = `SELECT email, name FROM ${name} WHERE staffid IN ('123', '222');`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where id and continent match the provided values', () => {
      const name = 'countries';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addFilter('id', OP_EQUALS, 3);
      ast.addFilter('continent', OP_EQUALS, 'Asia');
      const expectedQuery = `SELECT * FROM ${name} WHERE id = 3 AND continent = 'Asia';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with name, id and continent selected where id and continent match the provided values', () => {
      const name = 'countries';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addColumns(['name', 'id', 'continent']);
      ast.addFilter('id', OP_EQUALS, 3);
      ast.addFilter('continent', OP_EQUALS, 'Asia');
      const expectedQuery = `SELECT name, id, continent FROM ${name} WHERE id = 3 AND continent = 'Asia';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    xit('Should return a querystring witha select to a sql view with filtering parameters', () => {
      const name = 'view_rolemembers';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQuery = `SELECT * FROM ${name} WHERE email = 'manager@mail.com';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addFilter('shiftstartdatetime', OP_GTE, '2019-06-20T12:00:00');
      ast.addFilter('shiftstartdatetime', OP_LT, '2019-06-22T12:00:00');
      const expectedQuery = `SELECT * FROM ${name} WHERE shiftstartdatetime >= '2019-06-20T12:00:00' AND shiftstartdatetime < '2019-06-22T12:00:00';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with name selected where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const ast = new AbstractSyntaxTree(SELECT_QUERY, name, TABLE);
      ast.addColumns('firstname');
      ast.addFilter('firstname', OP_EQUALS, 'Julius');
      ast.addFilter('shiftstartdatetime', OP_GT, '2019-06-20T12:00:00');
      ast.addFilter('shiftstartdatetime', OP_LTE, '2019-06-22T12:00:00');
      const expectedQuery = `SELECT firstname FROM ${name} WHERE firstname = 'Julius' AND shiftstartdatetime > '2019-06-20T12:00:00' AND shiftstartdatetime <= '2019-06-22T12:00:00';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('v1 POST - querystring builder', () => {
    it('Should return a querystring to insert values into columns', () => {
      const name = 'staff';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const ast = new AbstractSyntaxTree(INSERT_QUERY, name, TABLE);
      ast.addColumns(['name', 'age', 'email', 'roles']);
      ast.addRow(body);
      const expectedQuery = `INSERT INTO ${name} (name, age, email, roles) VALUES ('John', '34', 'john@mail.com', '["linemanager","systemuser"]');`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with option to return all inserted data', () => {
      const name = 'staff';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com' };
      const ast = new AbstractSyntaxTree(INSERT_QUERY, name, TABLE);
      ast.addColumns(['name', 'age', 'email']);
      ast.addRow(body);
      ast.returnData();

      const expectedQuery = `INSERT INTO ${name} (name, age, email) VALUES ('John', '34', 'john@mail.com') RETURNING *;`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with option to insert multiple rows, without returning the data inserted', () => {
      const name = 'staff';
      const body = [
        { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
        { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
      ];
      const ast = new AbstractSyntaxTree(INSERT_QUERY, name, TABLE);
      ast.addColumns(['name', 'age', 'email']);
      ast.addRow(body[0]);
      ast.addRow(body[1]);
      const expectedQuery = `INSERT INTO ${name} (name, age, email) VALUES ('John', '34', 'john@mail.com'), ('Rachel', '32', 'rachel@mail.com');`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with option to insert multiple rows, returning the data inserted', () => {
      const name = 'staff';
      const body = [
        { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
        { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
      ];
      const ast = new AbstractSyntaxTree(INSERT_QUERY, name, TABLE);
      ast.addColumns(['name', 'age', 'email']);
      ast.addRow(body[0]);
      ast.addRow(body[1]);
      ast.returnData();
      const expectedQuery = `INSERT INTO ${name} (name, age, email) VALUES ('John', '34', 'john@mail.com'), ('Rachel', '32', 'rachel@mail.com') RETURNING *;`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('v1 PATCH - querystring builder', () => {
    it('Should return a querystring to update existing data matching an id', () => {
      const name = 'identity';
      const body = { 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const ast = new AbstractSyntaxTree(UPDATE_QUERY, name, TABLE);
      ast.addFilter('id', OP_EQUALS, id);
      ast.addColumns(['email', 'roles']);
      ast.addRow(body);
      const expectedQuery = `UPDATE ${name} SET email='${body.email}', roles=${JSON.stringify(body.roles)} WHERE id = '${id}';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to update existing data mathing an id, with option to return all updated data', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const body = { 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const ast = new AbstractSyntaxTree(UPDATE_QUERY, name, TABLE);
      ast.addFilter('id', OP_EQUALS, id);
      ast.addColumns(['age', 'email', 'roles']);
      ast.addRow(body);
      ast.returnData();
      const expectedQuery = `UPDATE ${name} SET age='${body.age}', email='${body.email}', roles=${JSON.stringify(body.roles)} WHERE id = '${id}' RETURNING *;`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to update existing data matching query parameters', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const firstname = 'Pedro';
      const body = { 'firstname': 'John' };
      const ast = new AbstractSyntaxTree(UPDATE_QUERY, name, TABLE);
      ast.addFilter('firstname', OP_EQUALS, firstname);
      ast.addFilter('id', OP_EQUALS, id);
      ast.addColumns('firstname');
      ast.addRow(body);
      const expectedQuery = `UPDATE ${name} SET firstname='${body.firstname}' WHERE firstname = '${firstname}' AND id = '${id}';`;
      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    xit('Should return a querystring to update existing data matching an id only, even if query parameters are provided', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const firstname = 'Pedro';
      const queryParams = `firstname=eq.${firstname},&id=eq.${id}`;
      const body = { 'firstname': 'John' };
      const expectedQuery = `UPDATE ${name} SET firstname='${body.firstname}' WHERE id = '${id}';`;
      const query = updateQueryBuilder({ body, name, id, queryParams });

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('v1 DELETE - querystring builder', () => {
    it('Should return a querystring to delete a row matching the email address', () => {
      const name = 'roles';
      const ast = new AbstractSyntaxTree(DELETE_QUERY, name, TABLE);
      ast.addFilter('email', OP_EQUALS, 'manager@mail.com');
      const expectedQuery = `DELETE FROM ${name} WHERE email = 'manager@mail.com';`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to delete a row matching the email address and id', () => {
      const name = 'roles';
      const ast = new AbstractSyntaxTree(DELETE_QUERY, name, TABLE);
      ast.addFilter('email', OP_EQUALS, 'manager@mail.com');
      ast.addFilter('id', OP_EQUALS, 123);
      const expectedQuery = `DELETE FROM ${name} WHERE email = 'manager@mail.com' AND id = 123;`;

      const query = generateCode(ast);

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('v1 POST To View Function - querystring builder', () => {
    it('Should return a querystring for a function view', () => {
      const name = 'staffdetails';
      const body = { 'argstaffemail': 'daisy@mail.com' };
      const expectedQuery = `SELECT * FROM ${name}(argstaffemail=>'daisy@mail.com');`;
      const query = selectQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for a function view with multiple arguments', () => {
      const name = 'staffdetails';
      const body = { 'argfirstname': 'Andy', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQuery = `SELECT * FROM ${name}(argfirstname=>'Andy',argstaffid=>'af4601db-1640-4ff2-a4cc-da44bce99226');`;
      const query = selectQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for a function view with multiple arguments and selected columns', () => {
      const name = 'staffdetails';
      const queryParams = 'select=email';
      const body = { 'argfirstname': 'Lauren', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQuery = `SELECT email FROM ${name}(argfirstname=>'Lauren',argstaffid=>'af4601db-1640-4ff2-a4cc-da44bce99226');`;
      const query = selectQueryBuilder({ name, body, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for a function view with multiple arguments selected columns and filtering parameters', () => {
      const name = 'staffdetails';
      const queryParams = 'select=email&lastname=eq.Smith';
      const body = { 'argfirstname': 'John', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQuery = `SELECT email FROM ${name}(argfirstname=>'John',argstaffid=>'af4601db-1640-4ff2-a4cc-da44bce99226') WHERE lastname = 'Smith';`;
      const query = selectQueryBuilder({ name, body, queryParams });

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('v2 GET - querystring builder', () => {
    it('Should return a querystring with two columns selected filtered by name and city and a limit of 5 rows', () => {
      const name = 'roles';
      const queryParams = {
        'select': 'name,city',
        'filter': [
          'name=eq.Tilbury 1',
          'city=eq.London',
        ],
        'limit': '5',
      };
      const expectedQuery = `SELECT name,city FROM ${name} WHERE name = 'Tilbury 1' AND city = 'London' LIMIT 5;`;
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with all columns filtering by firstname and a limit of 1 row', () => {
      const name = 'roles';
      const queryParams = {
        'filter': [
          'firstname=eq.Pedro',
        ],
        'limit': '1',
      };
      const expectedQuery = `SELECT * FROM ${name} WHERE firstname = 'Pedro' LIMIT 1;`;
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with all columns and a limit of 1 row', () => {
      const name = 'roles';
      const queryParams = { 'limit': '1' };
      const expectedQuery = `SELECT * FROM ${name} LIMIT 1;`;
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return an empty querystring if there is more than one select in the query params', () => {
      const name = 'roles';
      const queryParams = {
        'limit': ['3', '77'],
        'select': ['name,age', 'location'],
      };
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal('');
    });
  });
});
