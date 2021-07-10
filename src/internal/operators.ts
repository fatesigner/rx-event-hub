/**
 * operators
 */

import { tap } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';

import { IEvent, RxEventHub } from './core';

/**
 * Rxjs pipe for emit specified event or eventHandler
 * @param event
 * @param payload
 * @return MonoTypeOperatorFunction
 */
export function rxEmit<T, R>(event: IEvent<R>, payload?: (value: T) => R): MonoTypeOperatorFunction<T> {
  return function (source$) {
    return source$.pipe(
      tap((v: T) => {
        if (payload) {
          const r = payload(v);
          RxEventHub.emit(event, r);
        } else {
          RxEventHub.emit(event);
        }
      })
    );
  };
}
