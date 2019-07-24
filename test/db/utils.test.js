const { expect } = require('chai');

// local imports
const logger = require('../../app/config/logger');
const queryBuilder = require('../../app/db/utils');

describe('Test querystring builder', () => {
  before(() => {
    // disable logging
    logger.silent = true;
  });

  describe('GET - querystring builder', () => {
    it('Should return a querystring with two columns selected', () => {
      const expectedQuery = 'SELECT developer, linemanager FROM roles;';
      const query = queryBuilder('roles', { queryParams: 'select=developer,linemanager' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with three columns selected', () => {
      const expectedQuery = 'SELECT firstname, lastname, email FROM users;';
      const query = queryBuilder('users', { queryParams: 'select=firstname,lastname,email' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return an empty querystring if no filters are passed', () => {
      const expectedQuery = '';
      const query = queryBuilder('users', { queryParams: 'select=' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data', () => {
      const expectedQuery = 'SELECT * FROM users;';
      const query = queryBuilder('users', {});
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all team data where name matches team name', () => {
      const expectedQuery = 'SELECT * FROM team WHERE name = \'Tilbury 2\';';
      const query = queryBuilder('team', { queryParams: 'name=eq.Tilbury%202' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where email matches user email', () => {
      const expectedQuery = 'SELECT * FROM users WHERE email = \'john@mail.com\';';
      const query = queryBuilder('users', { queryParams: 'email=eq.john@mail.com' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where email does not match user email', () => {
      const expectedQuery = 'SELECT * FROM users WHERE email != \'john@mail.com\';';
      const query = queryBuilder('users', { queryParams: 'email=neq.john@mail.com' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where name is null', () => {
      const expectedQuery = 'SELECT * FROM users WHERE name IS NULL;';
      const query = queryBuilder('users', { queryParams: 'name=eq.null' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where name is not null', () => {
      const expectedQuery = 'SELECT * FROM users WHERE name IS NOT NULL;';
      const query = queryBuilder('users', { queryParams: 'name=neq.null' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with a column selected filtering by an array', () => {
      const expectedQuery = 'SELECT email FROM users WHERE staffid IN (\'123\', \'222\');'
      const query = queryBuilder('users', { queryParams: 'select=email&staffid=in.%28123,222%29' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with two columns selected filtering by an array', () => {
      const expectedQuery = 'SELECT email, name FROM users WHERE staffid IN (\'123\', \'222\');'
      const query = queryBuilder('users', { queryParams: 'select=email,name&staffid=in.%28123,222%29' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where id and continent match the provided values', () => {
      const expectedQuery = 'SELECT * FROM countries WHERE id = 3 AND continent = \'Asia\';'
      const query = queryBuilder('countries', { queryParams: 'id=eq.3,&continent=eq.Asia' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with name, id and continent selected where id and continent match the provided values', () => {
      const expectedQuery = 'SELECT name, id, continent FROM countries WHERE id = 3 AND continent = \'Asia\';'
      const query = queryBuilder('countries', { queryParams: 'select=name,id,continent&id=eq.3,&continent=eq.Asia' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with a select to a sql view with filtering parameters', () => {
      const expectedQuery = 'SELECT * FROM view_rolemembers WHERE email = \'manager@mail.com\';'
      const query = queryBuilder('view_rolemembers', { queryParams: 'email=eq.manager@mail.com' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where shiftstartdatetime matches the date range values', () => {
      const expectedQuery = 'SELECT * FROM getoarrecords WHERE shiftstartdatetime >= \'2019-06-20T12:00:00\' AND shiftstartdatetime < \'2019-06-22T12:00:00\';'
      const query = queryBuilder('getoarrecords', { queryParams: 'shiftstartdatetime=gte.2019-06-20T12:00:00,&shiftstartdatetime=lt.2019-06-22T12:00:00' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with name selected where shiftstartdatetime matches the date range values', () => {
      const expectedQuery = 'SELECT firstname FROM getoarrecords WHERE firstname = \'Julius\' AND shiftstartdatetime > \'2019-06-20T12:00:00\' AND shiftstartdatetime <= \'2019-06-22T12:00:00\';'
      const query = queryBuilder('getoarrecords', { queryParams: 'select=firstname&firstname=eq.Julius,&shiftstartdatetime=gt.2019-06-20T12:00:00,&shiftstartdatetime=lte.2019-06-22T12:00:00' });
      expect(query).to.equal(expectedQuery);
    });
  });

  describe('POST - querystring builder', () => {
    it('Should return a querystring for a function view', () => {
      const body = {'argstaffemail': 'daisy@mail.com'};
      const expectedQuery = 'SELECT * FROM staffdetails(argstaffemail=>\'daisy@mail.com\');';
      const query = queryBuilder('staffdetails', {  body: body });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for a function view with multiple arguments', () => {
      const body = {'argfirstname': 'Andy', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226'};
      const expectedQuery = 'SELECT * FROM staffdetails(argfirstname=>\'Andy\',argstaffid=>\'af4601db-1640-4ff2-a4cc-da44bce99226\');';
      const query = queryBuilder('staffdetails', {  body: body });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for a function view with multiple arguments and selected columns', () => {
      const body = {'argfirstname': 'Lauren', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226'};
      const expectedQuery = 'SELECT email FROM staffdetails(argfirstname=>\'Lauren\',argstaffid=>\'af4601db-1640-4ff2-a4cc-da44bce99226\');';
      const query = queryBuilder('staffdetails', { queryParams: 'select=email', body: body });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for a function view with multiple arguments selected columns and filtering parameters', () => {
      const body = {'argfirstname': 'John', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226'};
      const expectedQuery = 'SELECT email FROM staffdetails(argfirstname=>\'John\',argstaffid=>\'af4601db-1640-4ff2-a4cc-da44bce99226\') WHERE lastname = \'Smith\';';
      const query = queryBuilder('staffdetails', { queryParams: 'select=email&lastname=eq.Smith', body: body });
      expect(query).to.equal(expectedQuery);
    });
  });

  describe('DELETE - querystring builder', () => {
    it('Should return a querystring to delete a row matching the email address', () => {
      const expectedQuery = 'DELETE FROM roles WHERE email = \'manager@mail.com\';'
      const query = queryBuilder('roles', { queryParams: 'email=eq.manager@mail.com', method: 'DELETE' });
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring to delete a row matching the email address and id', () => {
      const expectedQuery = 'DELETE FROM roles WHERE email = \'manager@mail.com\' AND id = 123;';
      const query = queryBuilder('roles', { queryParams: 'email=eq.manager@mail.com,&id=eq.123', method: 'DELETE' });
      expect(query).to.equal(expectedQuery);
    });
  });
});
