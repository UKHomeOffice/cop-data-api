const sinon = require('sinon');

const { isEmailValid, getEmailFromRequest } = require('../../../app/utils/email');

describe('Test isEmailValid', () => {
  describe('when it is called', () => {
    describe('and the email is valid', () => {
      it('should return true', () => {
        const email = 'dermot.o%27leary@notahacker.com';

        sinon.assert.match(isEmailValid(email), true);
      });
    });

    describe('and the email is NOT valid', () => {
      it('should return false', () => {
        const email = 'dermot.o%27leary@definitely%27ahacker.com';

        sinon.assert.match(isEmailValid(email), false);
      });
    });
  });
});

describe('Test getEmailFromRequest', () => {
  describe('when it is called', () => {
    describe('and the request has an email query string', () => {
      describe('and the email is encoded', () => {
        it('should return the email unencoded', () => {
          const email = 'q.dermot.o%27leary@notahacker.com';
          const request = { originalUrl: `http://localhost:8080/v2/roles?email=${email}` };

          sinon.assert.match(getEmailFromRequest(request), 'q.dermot.o\'leary@notahacker.com');
        });
      });

      describe('and the email is NOT encoded', () => {
        it('should return the email as is', () => {
          const email = 'q.dermot.o\'leary@notahacker.com';
          const request = { originalUrl: `http://localhost:8080/v2/roles?email=${email}` };

          sinon.assert.match(getEmailFromRequest(request), email);
        });
      });
    });

    describe('and the request does NOT have an email query string', () => {
      it('should return false', () => {
        const request = { originalUrl: 'http://localhost:8080/v2/roles?filter=eq.dermot.o%27leary@notahacker.com' };

        sinon.assert.match(getEmailFromRequest(request), false);
      });
    });
  });
});
