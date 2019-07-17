const { expect } = require('chai');

// local imports
const logger = require('../../config/logger');
const queryBuilder = require('../../db/utils');

describe('Test query filter decoder', () => {
  before(() => {
    // disable logging
    logger.silent = true;
  });

  describe('GET', () => {
    it('Should return a querystring with two columns selected', () => {
      const expectedQuery = 'SELECT developer, linemanager FROM roles;';
      const query = queryBuilder('roles', 'select=developer,linemanager');
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring with three columns selected', () => {
      const expectedQuery = 'SELECT firstname, lastname, email FROM users;';
      const query = queryBuilder('users', 'select=firstname,lastname,email');
      expect(query).to.equal(expectedQuery);
    });

    it('Should return an empty querystring if no filters are passed', () => {
      const expectedQuery = '';
      const query = queryBuilder('users', 'select=');
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data', () => {
      const expectedQuery = 'SELECT * FROM users;';
      const query = queryBuilder('users');
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all team data where name matches team name', () => {
      const expectedQuery = 'SELECT * FROM team WHERE name = \'Tilbury 2\';';
      const query = queryBuilder('team', 'name=eq.Tilbury%202');
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where email matches user email', () => {
      const expectedQuery = 'SELECT * FROM users WHERE email = \'john@mail.com\';';
      const query = queryBuilder('users', 'email=eq.john@mail.com');
      expect(query).to.equal(expectedQuery);
    });

    it('Should return a querystring for all data where name is null', () => {
      const expectedQuery = 'SELECT * FROM users WHERE name IS NULL;';
      const query = queryBuilder('users', 'name=eq.null');
      expect(query).to.equal(expectedQuery);
    });
  });
});
