const { expect } = require('chai');

// local imports
const {
  parameterizedQueryBuilder,
  selectQueryBuilderV2,
} = require('../../../app/db/utils');

describe('Test database utils', () => {
  describe('v1 GET - querystring builder', () => {
    it('Should return a querystring with two columns selected', () => {
      const name = 'roles';
      const method = 'get';
      const queryParams = 'select=developer,linemanager';
      const expectedQueryObject = {
        'text': `SELECT developer, linemanager FROM ${name}`,
        'values': [],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with three columns selected', () => {
      const name = 'roles';
      const method = 'get';
      const queryParams = 'select=firstname,lastname,email';
      const expectedQueryObject = {
        'text': `SELECT firstname, lastname, email FROM ${name}`,
        'values': [],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return an empty querystring if no filters are passed', () => {
      const name = 'roles';
      const method = 'get';
      const queryParams = 'select=';
      const expectedQueryObject = {
        'text': '',
        'values': [],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for all data', () => {
      const name = 'users';
      const method = 'get';
      const queryParams = '';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name}`,
        'values': [],
      };
      const query = parameterizedQueryBuilder({ name, method });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for all team data where name matches team name', () => {
      const name = 'team';
      const method = 'get';
      const queryParams = 'name=eq.Tilbury%202';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name} WHERE name = $1`,
        'values': ['Tilbury 2'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for all data where email matches user email', () => {
      const name = 'users';
      const method = 'get';
      const queryParams = 'email=eq.john@mail.com';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name} WHERE email = $1`,
        'values': ['john@mail.com'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for all data where name is null', () => {
      const name = 'users';
      const method = 'get';
      const queryParams = 'name=eq.null';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name} WHERE name IS NULL`,
        'values': [],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with a column selected filtering by an array', () => {
      const name = 'users';
      const method = 'get';
      const queryParams = 'select=email&staffid=in.%28123,222%29';
      const expectedQueryObject = {
        'text': `SELECT email FROM ${name} WHERE staffid IN ($1, $2)`,
        'values': ['123', '222'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with two columns selected filtering by an array', () => {
      const name = 'users';
      const method = 'get';
      const queryParams = 'select=email,name&staffid=in.%28123,222%29';
      const expectedQueryObject = {
        'text': `SELECT email, name FROM ${name} WHERE staffid IN ($1, $2)`,
        'values': ['123', '222'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for all data where id and continent match the provided values', () => {
      const name = 'countries';
      const method = 'get';
      const queryParams = 'id=eq.3,&continent=eq.Asia';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name} WHERE id = $1 AND continent = $2`,
        'values': ['3', 'Asia'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with name, id and continent selected where id and continent match the provided values', () => {
      const name = 'countries';
      const method = 'get';
      const queryParams = 'select=name,id,continent&id=eq.3,&continent=eq.Asia';
      const expectedQueryObject = {
        'text': `SELECT name, id, continent FROM ${name} WHERE id = $1 AND continent = $2`,
        'values': ['3', 'Asia'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring witha select to a sql view with filtering parameters', () => {
      const name = 'view_rolemembers';
      const method = 'get';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name} WHERE email = $1`,
        'values': ['manager@mail.com'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for all data where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const method = 'get';
      const queryParams = 'shiftstartdatetime=gte.2019-06-20T12:00:00,&shiftstartdatetime=lt.2019-06-22T12:00:00';
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name} WHERE shiftstartdatetime >= $1 AND shiftstartdatetime < $2`,
        'values': ['2019-06-20T12:00:00', '2019-06-22T12:00:00'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with name selected where shiftstartdatetime matches the date range values', () => {
      const name = 'getoarrecords';
      const method = 'get';
      const queryParams = 'select=firstname&firstname=eq.Julius,&shiftstartdatetime=gt.2019-06-20T12:00:00,&shiftstartdatetime=lte.2019-06-22T12:00:00';
      const expectedQueryObject = {
        'text': `SELECT firstname FROM ${name} WHERE firstname = $1 AND shiftstartdatetime > $2 AND shiftstartdatetime <= $3`,
        'values': ['Julius', '2019-06-20T12:00:00', '2019-06-22T12:00:00'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });
  });

  describe('v1 POST - querystring builder', () => {
    it('Should return a querystring to insert values into columns', () => {
      const name = 'staff';
      const method = 'post';
      const body = [
        {
          'name': 'John',
          'age': 34,
          'email': 'john@mail.com',
          'roles': ['linemanager', 'systemuser'],
        },
      ];
      const expectedQueryObject = {
        'text': `INSERT INTO ${name} (name, age, email, roles) VALUES ($1, $2, $3, $4)`,
        'values': ['John', 34, 'john@mail.com', `${JSON.stringify(['linemanager', 'systemuser'])}`],
      };
      const query = parameterizedQueryBuilder({ name, method, body });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with option to return all inserted data', () => {
      const name = 'staff';
      const method = 'post';
      const body = { 'name': 'John', 'age': 34, 'email': 'john@mail.com' };
      const expectedQueryObject = {
        'text': `INSERT INTO ${name} (name, age, email) VALUES ($1, $2, $3) RETURNING *`,
        'values': ['John', 34, 'john@mail.com'],
      };
      const prefer = 'return=representation';
      const query = parameterizedQueryBuilder({ name, method, body, prefer });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with option to insert multiple rows, without returning the data inserted', () => {
      const name = 'staff';
      const method = 'post';
      const body = [
        { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
        { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
      ];
      const expectedQueryObject = {
        'text': `INSERT INTO ${name} (name, age, email) VALUES ($1, $2, $3),($4, $5, $6)`,
        'values': ['John', 34, 'john@mail.com', 'Rachel', 32, 'rachel@mail.com'],
      };
      const query = parameterizedQueryBuilder({ name, method, body });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with option to insert multiple rows, returning the data inserted', () => {
      const name = 'staff';
      const method = 'post';
      const body = [
        { 'name': 'John', 'age': 34, 'email': 'john@mail.com' },
        { 'name': 'Rachel', 'age': 32, 'email': 'rachel@mail.com' },
        { 'name': 'Wendy', 'age': 29, 'email': null },
      ];
      const expectedQueryObject = {
        'text': `INSERT INTO ${name} (name, age, email) VALUES ($1, $2, $3),($4, $5, $6),($7, $8, NULL) RETURNING *`,
        'values': ['John', 34, 'john@mail.com', 'Rachel', 32, 'rachel@mail.com', 'Wendy', 29],
      };
      const prefer = 'return=representation';
      const query = parameterizedQueryBuilder({ name, method, body, prefer });

      expect(query).to.deep.equal(expectedQueryObject);
    });
  });

  describe('v1 PATCH - querystring builder', () => {
    it('Should return a querystring to update existing data matching an id', () => {
      const name = 'identity';
      const method = 'update';
      const queryParams = 'id=eq.2553b00e-3cb0-441d-b29d-17196491a1e5';
      const body = { 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQueryObject = {
        'text': `UPDATE ${name} SET email=$1, roles=$2 WHERE id = $3`,
        'values': ['john@mail.com', `${JSON.stringify(['linemanager', 'systemuser'])}`, '2553b00e-3cb0-441d-b29d-17196491a1e5'],
      };
      const query = parameterizedQueryBuilder({ name, method, body, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring to update existing data mathing an id, with option to return all updated data', () => {
      const name = 'identity';
      const method = 'update';
      const queryParams = 'id=eq.2553b00e-3cb0-441d-b29d-17196491a1e5';
      const prefer = 'return=representation';
      const body = { 'age': 34, 'email': 'john@mail.com', 'roles': ['linemanager', 'systemuser'] };
      const expectedQueryObject = {
        'text': `UPDATE ${name} SET age=$1, email=$2, roles=$3 WHERE id = $4 RETURNING *`,
        'values': [34, 'john@mail.com', `${JSON.stringify(['linemanager', 'systemuser'])}`, '2553b00e-3cb0-441d-b29d-17196491a1e5'],
      };
      const query = parameterizedQueryBuilder({ name, method, body, prefer, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring to update existing data matching query parameters', () => {
      const name = 'identity';
      const method = 'update';
      const queryParams = 'firstname=eq.Pedro,&id=eq.2553b00e-3cb0-441d-b29d-17196491a1e5';
      const body = { 'firstname': 'John' };
      const expectedQueryObject = {
        'text': `UPDATE ${name} SET firstname=$1 WHERE firstname = $2 AND id = $3`,
        'values': ['John', 'Pedro', '2553b00e-3cb0-441d-b29d-17196491a1e5'],
      };
      const query = parameterizedQueryBuilder({ name, method, body, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring to update existing data matching the query parameters are provided', () => {
      const name = 'identity';
      const method = 'update';
      const id = '2553b00e-3cb0-441d-b29d-17196491a1e5';
      const firstname = 'Pedro';
      const lastname = 'Miguel';
      const queryParams = `firstname=eq.${firstname},&lastname=eq.${lastname},&id=eq.${id}`;
      const body = { 'firstname': 'John', 'lastname': null };
      const expectedQueryObject = {
        'text': 'UPDATE identity SET firstname=$1, lastname=NULL WHERE firstname = $2 AND lastname = $3 AND id = $4',
        'values': ['John', 'Pedro', 'Miguel', '2553b00e-3cb0-441d-b29d-17196491a1e5'],
      };
      const query = parameterizedQueryBuilder({ name, method, body, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });
  });

  describe('v1 DELETE - querystring builder', () => {
    it('Should return a querystring to delete a row matching the email address', () => {
      const name = 'roles';
      const method = 'delete';
      const queryParams = 'email=eq.manager@mail.com';
      const expectedQuery = `DELETE FROM ${name} WHERE email = 'manager@mail.com';`;
      const expectedQueryObject = {
        'text': `DELETE FROM ${name} WHERE email = $1`,
        'values': ['manager@mail.com'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring to delete a row matching the email address and id', () => {
      const name = 'roles';
      const method = 'delete';
      const queryParams = 'email=eq.manager@mail.com,&id=eq.123';
      const expectedQueryObject = {
        'text': `DELETE FROM ${name} WHERE email = $1 AND id = $2`,
        'values': ['manager@mail.com', '123'],
      };
      const query = parameterizedQueryBuilder({ name, method, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });
  });

  describe('v1 POST To View Function - querystring builder', () => {
    it('Should return a querystring for a function view', () => {
      const name = 'staffdetails';
      const method = 'post-rpc';
      const body = { 'argstaffemail': 'daisy@mail.com' };
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name}(argstaffemail=>$1)`,
        'values': ['daisy@mail.com'],
      };
      const query = parameterizedQueryBuilder({ name, method, body });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for a function view with multiple arguments', () => {
      const name = 'staffdetails';
      const method = 'post-rpc';
      const body = { 'argfirstname': 'Andy', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQueryObject = {
        'text': `SELECT * FROM ${name}(argfirstname=>$1, argstaffid=>$2)`,
        'values': ['Andy', 'af4601db-1640-4ff2-a4cc-da44bce99226'],
      };
      const query = parameterizedQueryBuilder({ name, method, body });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for a function view with multiple arguments and selected columns', () => {
      const name = 'staffdetails';
      const method = 'post-rpc';
      const queryParams = 'select=email';
      const body = { 'argfirstname': 'Lauren', 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQueryObject = {
        'text': `SELECT email FROM ${name}(argfirstname=>$1, argstaffid=>$2)`,
        'values': ['Lauren', 'af4601db-1640-4ff2-a4cc-da44bce99226'],
      };
      const query = parameterizedQueryBuilder({ name, method, body, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring for a function view with multiple arguments selected columns and filtering parameters', () => {
      const name = 'staffdetails';
      const method = 'post-rpc';
      const queryParams = 'select=email&lastname=eq.Smith';
      const body = { 'argfirstname': 'John', 'arglastname': null, 'argstaffid': 'af4601db-1640-4ff2-a4cc-da44bce99226' };
      const expectedQueryObject = {
        'text': `SELECT email FROM ${name}(argfirstname=>$1, arglastname=>NULL, argstaffid=>$2) WHERE lastname = $3`,
        'values': ['John', 'af4601db-1640-4ff2-a4cc-da44bce99226', 'Smith'],
      };
      const query = parameterizedQueryBuilder({ name, method, body, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
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
      const expectedQueryObject = {
        'queryString': `SELECT name,city FROM ${name} WHERE name = $2 AND city = $3 LIMIT $1`,
        'values': ['5', 'Tilbury 1', 'London'],
      };
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with all columns filtering by firstname and a limit of 1 row', () => {
      const name = 'roles';
      const queryParams = {
        'filter': [
          'firstname=eq.Pedro',
        ],
        'limit': '1',
      };
      const expectedQueryObject = {
        'queryString': `SELECT * FROM ${name} WHERE firstname = $2 LIMIT $1`,
        'values': ['1', 'Pedro'],
      };
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with all columns and a limit of 1 row', () => {
      const name = 'roles';
      const queryParams = { 'limit': '1' };
      const expectedQueryObject = {
        'queryString': `SELECT * FROM ${name} LIMIT $1`,
        'values': ['1'],
      };
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return an empty querystring if there is more than one select in the query params', () => {
      const name = 'roles';
      const queryParams = {
        'limit': ['3', '77'],
        'select': ['name,age', 'location'],
      };
      const expectedQueryObject = {
        'queryString': '',
        'values': [],
      };
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with a column selected ordered by column ascending', () => {
      const name = 'team';
      const queryParams = {
        'limit': '3',
        'select': 'name',
        'sort': 'name.asc',
      };
      const expectedQueryObject = {
        'queryString': `SELECT name FROM ${name} ORDER BY name ASC LIMIT $1`,
        'values': ['3'],
      };
      const query = selectQueryBuilderV2({ name, queryParams });
      console.log(query)

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with all columns selected, filtered by name, sorted by name asc, size desc, and a limit of 3 rows', () => {
      const name = 'team';
      const queryParams = {
        'limit': '3',
        'filter': [
          'name=eq.Blue Team',
        ],
        'sort': 'name.asc,size.desc',
      };
      const expectedQueryObject = {
        'queryString': `SELECT * FROM ${name} WHERE name = $2 ORDER BY name ASC, size DESC LIMIT $1`,
        'values': ['3', 'Blue Team'],
      };
      const query = selectQueryBuilderV2({ name, queryParams });

      expect(query).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with all columns selected filtered by any value provided', () => {
      const name = 'country';
      const queryParams = {
        'filter': [
          'region=in.(EU)',
        ],
      };
      const expectedQueryFilter = `SELECT * FROM ${name} WHERE region IN ('EU');`;
      const expectedQueryObject = {
        'queryString': `SELECT * FROM ${name} WHERE region IN ($1)`,
        'values': ['EU'],
      };
      const queryFilter = selectQueryBuilderV2({ name, queryParams });

      expect(queryFilter).to.be.an('object');
      expect(queryFilter).to.deep.equal(expectedQueryObject);
    });

    it('Should return a querystring with all columns selected filtered by value equal to, and any value in tuple', () => {
      const name = 'country';
      const queryParams = {
        'filter': [
          'name=eq.Portugal',
          'region=in.(EU, AS)',
        ],
      };
      const expectedQueryObject = {
        'queryString': `SELECT * FROM ${name} WHERE name = $1 AND region IN ($2, $3)`,
        'values': ['Portugal', 'EU', 'AS'],
      };
      const queryFilter = selectQueryBuilderV2({ name, queryParams });

      expect(queryFilter).to.be.an('object');
      expect(queryFilter).to.deep.equal(expectedQueryObject);
    });

    it('Should return an empty querystring if limit is a string', () => {
      const name = 'roles';
      const queryParams = { 'limit': '-13' };
      const queryFilter = selectQueryBuilderV2({ name, queryParams });

      expect(queryFilter).to.be.an('object');
      expect(queryFilter.queryString).to.equal('');
    });
  });
});
