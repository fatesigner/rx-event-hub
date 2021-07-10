import { expect } from 'chai';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { RxEventHub, rxEmit } from '../dist';

jest.setTimeout(30000);

describe('# test operators', function () {
  it('## global', (done) => {
    // Define global event
    const EVENTS = {
      LOGIN: Symbol.for('LOGIN'),
      LOGOUT: Symbol.for('LOGOUT')
    };

    let message;

    RxEventHub.on(EVENTS.LOGOUT, (_user) => {
      message = _user + ' logout';
    });

    // After 2s, will receive LOGOUT event
    interval(2000)
      .pipe(take(2))
      .pipe(rxEmit(EVENTS.LOGOUT, (n) => 'Tom' + n))
      .subscribe({
        next(n) {
          if (n === 0) {
            expect(message).to.equal('Tom0 logout');
            // When received 0, then unsubscribe the event
            RxEventHub.unsubscribe(EVENTS.LOGOUT);
          } else {
            // Because the event is unsubscribed
            expect(message).to.equal('Tom0 logout');
          }
        },
        complete() {
          done();
        }
      });
  });
});
