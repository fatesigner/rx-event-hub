/**
 * utils
 */

import { IEvent, IEventHandler } from './core';

/**
 * If the type of event is IEventHandler
 * @param event
 * @return boolean
 */
export function isEventHandler<T>(event: IEvent<T>): event is IEventHandler<T> {
  return !!(event as IEventHandler<T>)?.obs;
}
