import { expect } from 'chai';
import { rxEmit, rxObs } from '../src';
import { Observable, of } from 'rxjs';
import { scan } from 'rxjs/operators';
import { createEvent, createReplayEvent, RxEventHub } from '../dist';

jest.setTimeout(30000);

describe('# test core', function () {
  it('## global', () => {
    // Define global event
    const EVENTS = {
      LOGIN: Symbol.for('LOGIN'),
      LOGOUT: Symbol.for('LOGOUT')
    };

    let user;
    let user2;
    let user3;

    // emit Tom
    RxEventHub.emit(EVENTS.LOGIN, 'Tom');

    RxEventHub.on(EVENTS.LOGIN, (_user) => {
      user = _user;
    });
    RxEventHub.one(EVENTS.LOGIN, (_user) => {
      user3 = _user;
    });
    expect(user).to.be.undefined;
    expect(user2).to.be.undefined;
    expect(user3).to.be.undefined;

    // emit Tom2
    RxEventHub.emit(EVENTS.LOGIN, 'Tom2');

    expect(user).to.equal('Tom2');
    expect(user2).to.be.undefined;
    expect(user3).to.equal('Tom2');

    RxEventHub.on(EVENTS.LOGIN, (_user) => {
      user2 = 'Hello ' + _user;
    });

    // emit Jerry
    RxEventHub.emit(EVENTS.LOGIN, 'Jerry');

    expect(user).to.equal('Jerry');
    expect(user2).to.equal('Hello Jerry');
    expect(user3).to.equal('Tom2');
  });

  it('## createEvent', () => {
    let user;
    let message;

    const events = {
      login$: createReplayEvent<string>(),
      logout$: createEvent<string>()
    };

    // emit
    events.login$.emit('Tom');
    events.logout$.emit('Jerry');

    const login$$ = events.login$.on((_user) => {
      user = _user;
    });
    const logout$$ = events.logout$.on((_message) => {
      message = _message;
    });

    expect(user).to.equal('Tom');
    expect(message).to.be.undefined;

    // emit
    events.login$.emit('Tom2');
    events.logout$.emit('Jerry2');

    expect(user).to.equal('Tom2');
    expect(message).to.equal('Jerry2');

    // unsubscribe logout
    logout$$.unsubscribe();

    // emit
    events.login$.emit('Tom3');
    events.logout$.emit('Jerry3');

    expect(user).to.equal('Tom3');
    expect(message).to.equal('Jerry2');

    // unsubscribe login
    login$$.unsubscribe();

    // emit
    events.login$.emit('Tom4');
    events.logout$.emit('Jerry4');

    expect(user).to.equal('Tom3');
    expect(message).to.equal('Jerry2');
  });

  it('## angular', (done) => {
    class TestComponent {
      @rxObs('LOAD_ITEMS')
      items$: Observable<any[]>;
    }

    const test = new TestComponent();

    let items = [];

    test.items$.subscribe((_items) => {
      items = _items;
    });

    // 依次输出三个值，并在之后的 scan 操作符中将其转换为数组，最后经过 map 发布到 items$
    of('1', '2', '3')
      .pipe(
        scan((prev, cur) => {
          prev.push(cur);
          return prev;
        }, []),
        rxEmit('LOAD_ITEMS', (x) =>
          x.map((y) => ({
            title: y
          }))
        )
      )
      .subscribe({
        complete() {
          expect(items.length).equal(3);
          expect(items[2].title).equal('3');
          done();
        }
      });
  });
});
