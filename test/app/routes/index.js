const jwtSimple = require('jwt-simple');
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// local imports
const app = require('../../../app/routes');
const config = require('../../../app/config/core');
const getPool = require('../../../app/db/index');

describe('Test routes', () => {
  describe('GET - endpoint', () => {
    // create a token with an expiry date 1 hour in the future
    let expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);
    expiryTime = Math.round(expiryTime / 1000);
    const payload = {
      name: 'John',
      email: 'john@mail.com',
      exp: expiryTime,
      dbrole: 'readonly',
      iss: config.iss,
      aud: ['operational-data-api', 'api-cop'],
    };
    const token = jwtSimple.encode(payload, config.keycloakClientSecret);

    const data = {
      rows: [
        {
          id: '45995acb-8908-4d10-b9ff-4220d0838586',
          name: 'Tilbury Management Team',
          code: 'TILBURY',
          description: null,
          costcentrecode: 'TILBURY',
          parentteamid: '9a56319a-416a-4346-94dd-58bed59199d5',
          bffunctiontypeid: '63d59d5c-e1d0-4f16-9607-7aa2613cc695',
          ministryid: 1,
          departmentid: 1,
          directorateid: 2,
          branchid: 23,
          divisionid: 6,
          commandid: 43,
          validfrom: null,
          validto: null,
        },
      ],
    };

    it('Should return 400 when query parameters do not include filter and value', () => {
      request(app)
        .get('/v1/team?name')
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body).to.deep.equal({ error: 'Invalid query parameters' });
        });
    });

    it('Should return 400 when the table does not exist', () => {
      const pool = getPool();
      const queryStub = sinon.stub(pool, 'query');
      queryStub.onCall(0).rejects();

      return request(app)
        .get('/v1/teams')
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body).to.deep.equal({ error: 'Unable to run query in table teams' });
        });
    });

    it('Should return all data for an entity', () => {
      const pool = getPool();
      const queryStub = sinon.stub(pool, 'query');
      queryStub.onCall(0).resolves(data);

      return request(app)
        .get('/v1/team')
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.deep.equal(data.rows);
        });
    });
  });

  afterEach(() => {
    sinon.restore();
  });
});
