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

    it('Should return a querystring for all objects', () => {
      const expectedQuery = 'SELECT * FROM users;';
      const query = queryBuilder('users');

      expect(query).to.equal(expectedQuery);
    });
  });
});
