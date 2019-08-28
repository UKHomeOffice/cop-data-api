const { expect } = require('chai');

// local imports
const {
  deleteQueryBuilder,
  functionQueryBuilder,
  insertIntoQueryBuilder,
  selectQueryBuilder,
  selectQueryBuilderV2,
  updateQueryBuilder,
} = require('../../../app/db/utils');

describe('Test database utils', () => {
  describe('v1 GET - querystring builder', () => {
    it('Should return a querystring with two columns selected', () => {
      const name = 'roles';
      const queryParams = 'select=developer,linemanager';
      const expectedQuery = `SELECT developer, linemanager FROM ${name};`;
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with three columns selected', () => {
      const name = 'roles';
      const queryParams = 'select=firstname,lastname,email';
      const expectedQuery = `SELECT firstname, lastname, email FROM ${name};`;
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should throw an exception if no filters are passed', () => {
      const name = 'roles';
      const queryParams = 'select=';
      const expectedQuery = '';
      try {
        const { query, parameters } = selectQueryBuilder({ name, queryParams });
      } catch (err) {
        expect(err.message).to.equal('Select clause specified with no columns');
      }
    });

    it('Should return a querystring for all data', () => {
      const name = 'users';
      const queryParams = '';
      const expectedQuery = `SELECT * FROM ${name};`;
      const { query, parameters } = selectQueryBuilder({ name });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all team data where name matches team name', () => {
      const name = 'team';
      const queryParams = 'name=eq.Tilbury%202';
      const expectedQuery = `SELECT * FROM ${name} WHERE name = $1;`;
      const expectedParams = ['Tilbury 2'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring for all data where email matches user email', () => {
      const name = 'users';
      const queryParams = 'email=eq.john@mail.com';
      const expectedQuery = `SELECT * FROM ${name} WHERE email = $1;`;
      const expectedParams = ['john@mail.com'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where name is null', () => {
      const name = 'users';
      const queryParams = 'name=eq.null';
      const expectedQuery = `SELECT * FROM ${name} WHERE name IS NULL;`;
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with a column selected filtering by an array', () => {
      const name = 'users';
      const queryParams = 'select=email&staffid=in.%28123,222%29';
      const expectedQuery = `SELECT email FROM ${name} WHERE staffid IN ($1, $2);`;
      const expectedParams = ['123', '222'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with two columns selected filtering by an array', () => {
      const name = 'users';
      const queryParams = 'select=email,name&staffid=in.%28123,222%29';
      const expectedQuery = `SELECT email, name FROM ${name} WHERE staffid IN ($1, $2);`;
      const expectedParams = ['123', '222'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring for all data where id and continent match the provided values', () => {
      const name = 'countries';
      const queryParams = 'id=eq.3,&continent=eq.Asia';
      const expectedQuery = `SELECT * FROM ${name} WHERE id = $1 AND continent = $2;`;
      const expectedParams = [3, 'Asia'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with name, id and continent selected where id and continent match the provided values', () => {
      const name = 'countries';
      const queryParams = 'select=name,id,continent&id=eq.3,&continent=eq.Asia';
      const expectedQuery = `SELECT name, id, continent FROM ${name} WHERE id = $1 AND continent = $2;`;
      const expectedParams = [3, 'Asia'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring witha select to a sql view with filtering parameters', () => {
      const name = 'view_rolemembers';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQuery = `SELECT * FROM ${name} WHERE email = $1;`;
      const expectedParams = ['manager@mail.com'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring for all data where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const queryParams = 'shiftstartdatetime=gte.2019-06-20T12:00:00,&shiftstartdatetime=lt.2019-06-22T12:00:00';
      const expectedQuery = `SELECT * FROM ${name} WHERE shiftstartdatetime >= $1 AND shiftstartdatetime < $2;`;
      const expectedParams = ['2019-06-20T12:00:00', '2019-06-22T12:00:00'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with name selected where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const queryParams = 'select=firstname&firstname=eq.Julius,&shiftstartdatetime=gt.2019-06-20T12:00:00,&shiftstartdatetime=lte.2019-06-22T12:00:00';
      const expectedQuery = `SELECT firstname FROM ${name} WHERE firstname = $1 AND shiftstartdatetime > $2 AND shiftstartdatetime <= $3;`;
      const expectedParams = ['Julius', '2019-06-20T12:00:00', '2019-06-22T12:00:00'];
      const { query, parameters } = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });
  });

  describe('v1 POST - querystring builder', () => {
    it('Should return a querystring to insert values into columns', () => {
      const name = 'staff';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQuery = `INSERT INTO ${name} (name, age, email, roles) VALUES ($1, $2, $3, $4);`;
      const expectedParams = ['John', 34, 'john@mail.com', '["linemanager","systemuser"]'];
      const { query, parameters } = insertIntoQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with option to return all inserted data', () => {
      const name = 'staff';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com' };
      const expectedQuery = `INSERT INTO ${name} (name, age, email) VALUES ($1, $2, $3) RETURNING *;`;
      const expectedParams = ['John', 34, 'john@mail.com'];
      const prefer = 'return=representation';
      const { query, parameters } = insertIntoQueryBuilder({ name, body, prefer });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with option to insert multiple rows, without returning the data inserted', () => {
      const name = 'staff';
      const body = [
        { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
        { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
      ];
      const expectedQuery = `INSERT INTO ${name} (name, age, email) VALUES ($1, $2, $3), ($4, $5, $6);`;
      const expectedParams = ['John', 34, 'john@mail.com', 'Rachel', 32, 'rachel@mail.com'];
      const { query, parameters } = insertIntoQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with option to insert multiple rows, returning the data inserted', () => {
      const name = 'staff';
      const body = [
        { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
        { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
      ];
      const expectedQuery = `INSERT INTO ${name} (name, age, email) VALUES ($1, $2, $3), ($4, $5, $6) RETURNING *;`;
      const expectedParams = ['John', 34, 'john@mail.com', 'Rachel', 32, 'rachel@mail.com'];
      const prefer = 'return=representation';
      const { query, parameters } = insertIntoQueryBuilder({ name, body, prefer });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });
  });

  describe('v1 PATCH - querystring builder', () => {
    it('Should return a querystring to update existing data matching an id', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const body = { 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQuery = `UPDATE ${name} SET email=$1, roles=$2 WHERE id = $3;`;
      const expectedParams = [body.email, JSON.stringify(body.roles), id];
      const { query, parameters } = updateQueryBuilder({ body, name, id });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring to update existing data mathing an id, with option to return all updated data', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const prefer = 'return=representation';
      const body = { 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQuery = `UPDATE ${name} SET age=$1, email=$2, roles=$3 WHERE id = $4 RETURNING *;`;
      const expectedParams = [body.age, body.email, JSON.stringify(body.roles), id];
      const { query, parameters } = updateQueryBuilder({ body, name, id, prefer });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring to update existing data matching query parameters', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const firstname = 'Pedro';
      const queryParams = `firstname=eq.${firstname},&id=eq.${id}`;
      const body = { 'firstname': 'John' };
      const expectedParams = ['John', firstname, id];
      const expectedQuery = `UPDATE ${name} SET firstname=$1 WHERE firstname = $2 AND id = $3;`;
      const { query, parameters } = updateQueryBuilder({ body, name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring to update existing data matching an id only, even if query parameters are provided', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const firstname = 'Pedro';
      const queryParams = `firstname=eq.${firstname},&id=eq.${id}`;
      const body = { 'firstname': 'John' };
      const expectedQuery = `UPDATE ${name} SET firstname=$1 WHERE id = $2;`;
      const expectedParams = ['John', id];
      const { query, parameters } = updateQueryBuilder({ body, name, id, queryParams });
      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });
  });

  describe('v1 DELETE - querystring builder', () => {
    it('Should return a querystring to delete a row matching the email address', () => {
      const name = 'roles';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQuery = `DELETE FROM ${name} WHERE email = $1;`;
      const expectedParams = ['manager@mail.com'];
      const { query, parameters } = deleteQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring to delete a row matching the email address and id', () => {
      const name = 'roles';
      const queryParams = 'email=eq.manager@mail.com,&id=eq.123';
      const expectedQuery = `DELETE FROM ${name} WHERE email = $1 AND id = $2;`;
      const expectedParams = ['manager@mail.com', 123];
      const { query, parameters } = deleteQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });
  });

  describe('v1 POST To View Function - querystring builder', () => {
    it('Should return a querystring for a function view', () => {
      const name = 'staffdetails';
      const body = { 'argstaffemail': 'daisy@mail.com' };
      const expectedQuery = `SELECT * FROM ${name}(argstaffemail=>$1);`;
      const expectedParams = ['daisy@mail.com'];
      const { query, parameters } = functionQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring for a function view with multiple arguments', () => {
      const name = 'staffdetails';
      const body = { 'argfirstname': 'Andy', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQuery = `SELECT * FROM ${name}(argfirstname=>$1, argstaffid=>$2);`;
      const expectedParams = ['Andy', 'af4601db-1640-4ff2-a4cc-da44bce99226'];
      const { query, parameters } = functionQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring for a function view with multiple arguments and selected columns', () => {
      const name = 'staffdetails';
      const queryParams = 'select=email';
      const body = { 'argfirstname': 'Lauren', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQuery = `SELECT email FROM ${name}(argfirstname=>$1, argstaffid=>$2);`;
      const expectedParams = ['Lauren', 'af4601db-1640-4ff2-a4cc-da44bce99226'];
      const { query, parameters } = functionQueryBuilder({ name, body, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring for a function view with multiple arguments selected columns and filtering parameters', () => {
      const name = 'staffdetails';
      const queryParams = 'select=email&lastname=eq.Smith';
      const body = { 'argfirstname': 'John', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQuery = `SELECT email FROM ${name}(argfirstname=>$1, argstaffid=>$2) WHERE lastname = $3;`;
      const expectedParams = ['John', 'af4601db-1640-4ff2-a4cc-da44bce99226', 'Smith'];
      const { query, parameters } = functionQueryBuilder({ name, body, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
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
      const expectedQuery = `SELECT name, city FROM ${name} WHERE name = $1 AND city = $2 LIMIT 5;`;
      const expectedParams = ['Tilbury 1', 'London'];

      const { query, parameters } = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with all columns filtering by firstname and a limit of 1 row', () => {
      const name = 'roles';
      const queryParams = {
        'filter': [
          'firstname=eq.Pedro',
        ],
        'limit': '1',
      };
      const expectedQuery = `SELECT * FROM ${name} WHERE firstname = $1 LIMIT 1;`;
      const expectedParams = ['Pedro'];

      const { query, parameters } = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal(expectedQuery);
      expect(parameters).to.eql(expectedParams);
    });

    it('Should return a querystring with all columns and a limit of 1 row', () => {
      const name = 'roles';
      const queryParams = { 'limit': '1' };
      const expectedQuery = `SELECT * FROM ${name} LIMIT 1;`;
      const { query, parameters } = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return an empty querystring if there is more than one select in the query params', () => {
      const name = 'roles';
      const queryParams = { 'select': ['name,age', 'location'] };
      try {
        const { query, parameters } = selectQueryBuilderV2({ name, queryParams });
      } catch (error) {
        expect(error.message).to.equal('Only one value permitted for select and limit');
      }
    });

    it('Should return an empty querystring if there is more than one limit in the query params', () => {
      const name = 'roles';
      const queryParams = { 'limit': ['3', '77'] };
      try {
        const { query, parameters } = selectQueryBuilderV2({ name, queryParams });
      } catch (error) {
        expect(error.message).to.equal('Only one value permitted for select and limit');
      }
    });
  });
});
