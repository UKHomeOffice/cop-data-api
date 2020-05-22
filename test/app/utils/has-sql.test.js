const sinon = require('sinon');

const hasSql = require('../../../app/utils/has-sql');

describe('Test hasSql', () => {
  describe('when it is called', () => {
    describe('and the originalUrl contains SQL', () => {
      it('should NOT call next and should return Unauthorized message', () => {
        const value = 'http://localhost:8080/v2/roles?filter=name=eq.Manager\'--SELECT%20some,%20fields';

        sinon.assert.match(hasSql(value), true);
      });
    });

    describe('and the originalUrl does NOT contain SQL', () => {
      it('should call next and NOT return Unauthorized message', () => {
        const value = 'http://localhost/my/cool/url/has?no=sql';

        sinon.assert.match(hasSql(value), false);
      });
    });
  });
});
