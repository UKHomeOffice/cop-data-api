const { expect } = require('chai');

// local imports
const logger = require('../../../app/config/logger');
const {
  deleteQueryBuilder,
  insertIntoQueryBuilder,
  selectQueryBuilder,
  updateQueryBuilder,
} = require('../../../app/db/utils');

describe('Test querystring builder', () => {
  before(() => {
    // disable logging
    logger.silent = true;
  });

  describe('GET - querystring builder', () => {
    it('Should return a querystring with two columns selected', () => {
      const name = 'roles';
      const queryParams = 'select=developer,linemanager';
      const expectedQuery = `SELECT developer, linemanager FROM ${name};`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with three columns selected', () => {
      const name = 'roles';
      const queryParams = 'select=firstname,lastname,email';
      const expectedQuery = `SELECT firstname, lastname, email FROM ${name};`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return an empty querystring if no filters are passed', () => {
      const name = 'roles';
      const queryParams = 'select=';
      const expectedQuery = '';
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data', () => {
      const name = 'users';
      const queryParams = '';
      const expectedQuery = `SELECT * FROM ${name};`;
      const query = selectQueryBuilder({ name });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all team data where name matches team name', () => {
      const name = 'team';
      const queryParams = 'name=eq.Tilbury%202';
      const expectedQuery = `SELECT * FROM ${name} WHERE name = 'Tilbury 2';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where email matches user email', () => {
      const name = 'users';
      const queryParams = 'email=eq.john@mail.com';
      const expectedQuery = `SELECT * FROM ${name} WHERE email = 'john@mail.com';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where name is null', () => {
      const name = 'users';
      const queryParams = 'name=eq.null';
      const expectedQuery = `SELECT * FROM ${name} WHERE name IS NULL;`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with a column selected filtering by an array', () => {
      const name = 'users';
      const queryParams = 'select=email&staffid=in.%28123,222%29';
      const expectedQuery = `SELECT email FROM ${name} WHERE staffid IN ('123', '222');`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with two columns selected filtering by an array', () => {
      const name = 'users';
      const queryParams = 'select=email,name&staffid=in.%28123,222%29';
      const expectedQuery = `SELECT email, name FROM ${name} WHERE staffid IN ('123', '222');`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where id and continent match the provided values', () => {
      const name = 'countries';
      const queryParams = 'id=eq.3,&continent=eq.Asia';
      const expectedQuery = `SELECT * FROM ${name} WHERE id = 3 AND continent = 'Asia';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with name, id and continent selected where id and continent match the provided values', () => {
      const name = 'countries';
      const queryParams = 'select=name,id,continent&id=eq.3,&continent=eq.Asia';
      const expectedQuery = `SELECT name, id, continent FROM ${name} WHERE id = 3 AND continent = 'Asia';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring witha select to a sql view with filtering parameters', () => {
      const name = 'view_rolemembers';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQuery = `SELECT * FROM ${name} WHERE email = 'manager@mail.com';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const queryParams = 'shiftstartdatetime=gte.2019-06-20T12:00:00,&shiftstartdatetime=lt.2019-06-22T12:00:00';
      const expectedQuery = `SELECT * FROM ${name} WHERE shiftstartdatetime >= '2019-06-20T12:00:00' AND shiftstartdatetime < '2019-06-22T12:00:00';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with name selected where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const queryParams = 'select=firstname&firstname=eq.Julius,&shiftstartdatetime=gt.2019-06-20T12:00:00,&shiftstartdatetime=lte.2019-06-22T12:00:00';
      const expectedQuery = `SELECT firstname FROM ${name} WHERE firstname = 'Julius' AND shiftstartdatetime > '2019-06-20T12:00:00' AND shiftstartdatetime <= '2019-06-22T12:00:00';`;
      const query = selectQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('POST - querystring builder', () => {
    it('Should return a querystring to insert values into columns', () => {
      const name = 'staff';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQuery = `INSERT INTO ${name} (name,age,email,roles) VALUES ('John','34','john@mail.com','["linemanager","systemuser"]');`;
      const query = insertIntoQueryBuilder({ name, body });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with option to return all inserted data', () => {
      const name = 'staff';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com' };
      const expectedQuery = `INSERT INTO ${name} (name,age,email) VALUES ('John','34','john@mail.com') RETURNING *;`;
      const prefer = 'return=representation';
      const query = insertIntoQueryBuilder({ name, body, prefer });

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('PATCH - querystring builder', () => {
    it('Should return a querystring to update existing data matching an id', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const body = { 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQuery = `UPDATE ${name} SET email='${body.email}',roles=${JSON.stringify(body.roles)} WHERE id = '${id}';`;
      const query = updateQueryBuilder({ body, name, id });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to update existing data mathing an id, with option to return all updated data', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const prefer = 'return=representation';
      const body = { 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQuery = `UPDATE ${name} SET age='${body.age}',email='${body.email}',roles=${JSON.stringify(body.roles)} WHERE id = '${id}' RETURNING *;`;
      const query = updateQueryBuilder({ body, name, id, prefer });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to update existing data matching query parameters', () => {
      const name = 'identity';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const firstname = 'Pedro';
      const queryParams = `firstname=eq.${firstname},&id=eq.${id}`;
      const body = { 'firstname': 'John' };
      const expectedQuery = `UPDATE ${name} SET firstname='${body.firstname}' WHERE firstname = '${firstname}' AND id = '${id}';`;
      const query = updateQueryBuilder({ body, name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to update existing data matching an id only, even if query parameters are provided', () => {
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

  describe('DELETE - querystring builder', () => {
    it('Should return a querystring to delete a row matching the email address', () => {
      const name = 'roles';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQuery = `DELETE FROM ${name} WHERE email = 'manager@mail.com';`;
      const query = deleteQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to delete a row matching the email address and id', () => {
      const name = 'roles';
      const queryParams = 'email=eq.manager@mail.com,&id=eq.123';
      const expectedQuery = `DELETE FROM ${name} WHERE email = 'manager@mail.com' AND id = 123;`;
      const query = deleteQueryBuilder({ name, queryParams });

      expect(query).to.equal(expectedQuery);
    });
  });

  describe('POST To View Function - querystring builder', () => {
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
});
