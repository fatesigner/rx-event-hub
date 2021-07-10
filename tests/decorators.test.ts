import { expect } from 'chai';
import { Observable } from 'rxjs';
import { RxEventHub, rxOn, rxObs } from '../dist';

jest.setTimeout(30000);

// Define global event
const EVENTS = {
  LOGIN: Symbol.for('LOGIN'),
  LOGOUT: Symbol.for('LOGOUT')
};

describe('# test decorators', function () {
  it('## rxObs', () => {
    class TestComponent {
      user: string;

      @rxObs(EVENTS.LOGIN)
      login$: Observable<string>;

      @rxOn(EVENTS.LOGIN)
      onLogin() {}
    }
    const test = new TestComponent();
    let user;

    expect(test.user).to.be.undefined;
    expect(test.login$).to.not.be.undefined;

    // emit
    RxEventHub.emit(EVENTS.LOGIN, 'Tom');

    expect(test.user).to.be.undefined;

    test.login$.subscribe((_user) => {
      user = 'logined ' + _user;
    });

    // emit
    RxEventHub.emit(EVENTS.LOGIN, 'Tom2');

    expect(user).to.equal('logined Tom2');
  });

  it('## rxOn', () => {
    class TestComponent {
      user: string;

      @rxObs(EVENTS.LOGIN)
      login$: Observable<string>;

      @rxOn(EVENTS.LOGIN)
      onLogin(_user) {
        this.user = 'onLogin ' + _user;
      }
    }
    const test = new TestComponent();

    expect(test.user).to.be.undefined;
    expect(test.login$).to.not.be.undefined;

    // emit
    RxEventHub.emit(EVENTS.LOGIN, 'Tom');

    expect(test.user).to.equal('onLogin Tom');
  });
});
