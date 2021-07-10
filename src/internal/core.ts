import { take } from 'rxjs/operators';
import { Observable, PartialObserver, ReplaySubject, Subject, Subscription } from 'rxjs';

import { isEventHandler } from './utils';

export type IEventName = string | symbol;

export interface IEventHandler<T> {
  obs: () => Observable<T>;
  emit: (payload?: T) => void;
  on: (observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void) => Subscription;
  one: (observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void) => Subscription;
}

export type IEvent<T> = IEventName | IEventHandler<T>;

/**
 * 创建事件
 * Create an event handler
 * @return eventHandler
 */
export function createEvent<T>(): IEventHandler<T> {
  const subject = new Subject<T>();
  return {
    obs() {
      return new Observable<T>((subscriber) => {
        subject.subscribe({
          next: (payload: T) => {
            subscriber.next(payload);
          },
          complete() {
            subscriber.complete();
          },
          error(err) {
            subscriber.error(err);
          }
        });
        return () => {
          subscriber.unsubscribe();
        };
      });
    },
    emit(payload?) {
      subject.next(payload);
    },
    on(observer: PartialObserver<T>) {
      return subject.subscribe(observer);
    },
    one(observer: PartialObserver<T>) {
      return subject.pipe(take(1)).subscribe(observer);
    }
  };
}

/**
 * 创建一个可回放的事件
 * Create an event handler that can replay some values
 * @param bufferSize
 * @param windowTime
 * @return eventHandler
 */
export function createReplayEvent<T>(bufferSize = 1, windowTime = Infinity): IEventHandler<T> {
  const subject = new ReplaySubject<T>(bufferSize, windowTime);
  return {
    obs() {
      return new Observable<T>((subscriber) => {
        subject.subscribe({
          next: (payload: T) => {
            subscriber.next(payload);
          },
          complete() {
            subscriber.complete();
          },
          error(err) {
            subscriber.error(err);
          }
        });
        return () => {
          subscriber.unsubscribe();
        };
      });
    },
    emit(payload?) {
      subject.next(payload);
    },
    on(observer: PartialObserver<T>) {
      return subject.subscribe(observer);
    },
    one(observer: PartialObserver<T>) {
      return subject.pipe(take(1)).subscribe(observer);
    }
  };
}

/**
 * 事件总线
 * Rxjs event hub
 */
export class RxEventHub {
  private static readonly _subjects: { [key in string]: Subject<any> } = {};

  /**
   * 获取当前已缓存的事件主体（Emitter）
   * Get cached subject from event
   * @param event
   * @private
   */
  private static _getSubject<T>(event: IEventName) {
    let subject: Subject<T>;

    if (RxEventHub?._subjects && Object.prototype.hasOwnProperty.call(RxEventHub._subjects, event)) {
      subject = RxEventHub._subjects[event as string];
      if (!subject.closed) {
        return subject;
      }
    }

    subject = new Subject<T>();
    RxEventHub._subjects[event as string] = subject;

    return subject;
  }

  /**
   * 获取一个待观察的对象
   * Get a new observable from gobal event
   * @param event
   * @return Observable
   */
  static obs<T>(event: IEvent<T>): Observable<T> {
    if (isEventHandler(event)) {
      return (event as IEventHandler<T>).obs();
    } else {
      const subject = this._getSubject<T>(event);
      return subject.asObservable();
    }
  }

  /**
   * 发布全局事件
   * Publish a global event
   * @param event
   * @param payload
   */
  static emit<T>(event: IEvent<T>, payload?: T): void {
    if (isEventHandler(event)) {
      (event as IEventHandler<T>).emit(payload);
    } else {
      const subject = this._getSubject(event);
      subject.next(payload);
    }
  }

  /**
   * 订阅全局事件
   * Subscribe a gobal event
   * @param event
   * @param observerOrNext
   * @param error
   * @param complete
   * @return Subscription
   */
  static on<T>(
    event: IEvent<T>,
    observerOrNext?: PartialObserver<T> | ((value: T) => void),
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    if (isEventHandler(event)) {
      return (event as IEventHandler<T>).on(observerOrNext, error, complete);
    } else {
      const subject = this._getSubject<T>(event);
      return subject.subscribe(observerOrNext as (value: T) => void, error, complete);
    }
  }

  /**
   * 订阅全局事件，只订阅一次
   * Subscribe a gobal event only onece
   * @param event
   * @param observerOrNext
   * @param error
   * @param complete
   * @return Subscription
   */
  static one<T>(
    event: IEvent<T>,
    observerOrNext?: PartialObserver<T> | ((value: T) => void),
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    if (isEventHandler(event)) {
      return (event as IEventHandler<T>).one(observerOrNext, error, complete);
    } else {
      const subject = this._getSubject<T>(event);
      return subject.pipe(take(1)).subscribe(observerOrNext as (value: T) => void, error, complete);
    }
  }

  /**
   * 取消订阅
   * Unsubscribe cached subject
   * @param event 事件
   */
  static unsubscribe(event: string | symbol) {
    if (RxEventHub?._subjects && Object.prototype.hasOwnProperty.call(RxEventHub._subjects, event)) {
      const subject = RxEventHub._subjects[event as string];
      if (subject) {
        subject.unsubscribe();
        delete RxEventHub._subjects[event as string];
      }
    }
  }
}
