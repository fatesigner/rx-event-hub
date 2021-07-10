/**
 * decorators
 */

import { IEvent, RxEventHub } from './core';

/**
 * 属性修饰符，更改当前属性为一个 Observable 对象
 * Property decorator for subscribe event, will set this property to an observable
 * @param event
 * @return PropertyDecorator
 */
export function rxObs<T>(event: IEvent<T>): PropertyDecorator {
  return (target: any, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: RxEventHub.obs(event)
    });
  };
}

/**
 * 函数修饰符，将该函数添加到指定事件的观察者列表，事件触发后，该函数将会执行
 * Method decorator for subscribe event
 * @param event
 * @return MethodDecorator
 */
export function rxOn<T, R extends (...args: any[]) => any>(event: IEvent<T>): MethodDecorator {
  return (target: any, propertyKey, descriptor: TypedPropertyDescriptor<R>) => {
    const subscription = RxEventHub.on(event, descriptor.value.bind(target));

    // Unsubscribe in angular component, if the target has propertyKey ngOnDestroy.
    if (target.ngOnDestroy) {
      const oldNgOnDestroy = target.ngOnDestroy;
      target.ngOnDestroy = function (...args: any[]) {
        oldNgOnDestroy?.apply(this, args);
        subscription.unsubscribe();
      };
    }
  };
}

/**
 * Method decorator for subscribe event once
 * @param event
 * @return MethodDecorator
 */
export function rxOne<T, R extends (...args: any[]) => any>(event: IEvent<T>): MethodDecorator {
  return (target: any, propertyKey, descriptor: TypedPropertyDescriptor<R>) => {
    const subscription = RxEventHub.one(event, descriptor.value.bind(target));

    // Unsubscribe in angular component, if the target has propertyKey ngOnDestroy.
    if (target.ngOnDestroy) {
      const oldNgOnDestroy = target.ngOnDestroy;
      target.ngOnDestroy = function (...args: any[]) {
        oldNgOnDestroy?.apply(this, args);
        subscription.unsubscribe();
      };
    }
  };
}
