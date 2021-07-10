# RxEventHub

[![npm][npm-image]][npm-url]
[![download][download-image]][download-url]
[![commitizen][commitizen-image]][commitizen-url]

[npm-image]: https://img.shields.io/npm/v/rx-event-hub.svg?style=for-the-badge
[npm-url]: https://npmjs.com/package/rx-event-hub
[download-image]: https://img.shields.io/npm/dw/rx-event-hub.svg?style=for-the-badge&color=green
[download-url]: https://npmjs.com/package/rx-event-hub
[commitizen-image]: https://img.shields.io/badge/commitizen-friendly-green.svg?style=for-the-badge
[commitizen-url]: http://commitizen.github.io/cz-cli/

### Rxjs + Event Hub
> 基于 Rxjs 实现的可创建全局事件总线（发布-订阅模式）的 javascript 套件，适用于 web 和 node 环境

## 安装

```bash
npm i -S rx-event-hub
```

## 使用
### 全局
```ts
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { RxEventHub, rxEmit } from 'rx-event-hub';

// 定义事件
const EVENTS = {
  LOGIN: Symbol.for('LOGIN'),
  LOGOUT: Symbol.for('LOGOUT')
};

// 订阅 LOGIN 事件
RxEventHub.on(EVENTS.LOGIN, (user) => {
  console.log(`${user} logined`);
});

// 发布 LOGIN 事件
// 1、RxEventHub.emit()
RxEventHub.emit(EVENTS.LOGIN, 'Tom');

// 2、rxEmit()
// 在这里，模拟一个登录请求，等待 2s 返回一个角色名
timer(2000)
  .pipe(map(() => 'Admin'))
  .pipe(rxEmit(EVENTS.LOGIN))
  .subscribe((x) => {
    // 输出: 'Tom'
    console.log(x);
  });
```

### 创建自定义事件
```ts
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { createEvent, createReplayEvent, rxEmit } from 'rx-event-hub';

// 自定义事件
const events = {
  login$: createReplayEvent<string>(),
  logout$: createEvent()
};

// 订阅 LOGIN 事件
events.login$.on((user) => {
  console.log(`${user} logined`);
});

// 发布 LOGIN 事件
// 1、emit()
events.login$.emit('Tom');

// 2、rxEmit()
// 在这里，模拟一个登录请求，等待 2s 返回一个角色名
timer(2000)
  .pipe(map(() => 'Admin'))
  .pipe(rxEmit(events.login$))
  .subscribe((x) => {
    // 输出: 'Tom'
    console.log(x);
  });

// 因为 login$ 事件是通过 createReplayEvent 创建的，所以在事件发送之后再次订阅，可重复执行
events.login$.on((user) => {
  // 输出: 'Admin logined'
  console.log(`${user} logined`);
});
```

## API
#### RxEventHub.emit\<T\>(event: [IEvent](#IEvent)\<T\>, payload?: T): void
> 发布一个全局事件

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |
| payload | \<T\> | 消息数据 |

| Return | Description |
| --- | --- |
| Observable | 待订阅的对象 |

#### RxEventHub.on\<T\>(event: [IEvent](#IEvent)\<T\>, observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription
> 订阅全局事件.

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |

| Return | Description |
| --- | --- |
| Observable | 待订阅的对象 |

#### RxEventHub.one\<T\>(event: [IEvent](#IEvent)\<T\>, observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription
> 订阅全局事件，只观测一次，观测完成后该订阅会被自动取消

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |

| Return | Description |
| --- | --- |
| Observable | 待订阅的对象 |

#### RxEventHub.unsubscribe(event: string | symbol): void
> 取消订阅

| Param | Type | Description |
| --- | --- | --- |
| event | string or symbol | 事件名 |

#### createEvent\<T\>(): IEventHandler\<T\>
> 创建事件

| Return | Description |
| --- | --- |
| [IEventHandler](#IEventHandler) | 事件句柄 |

#### createReplayEvent\<T\>(bufferSize?: number, windowTime?: number): IEventHandler\<T\>
> 创建一个可回放的事件~~

| Param | Type | Description |
| --- | --- | --- |
| bufferSize | number | 回放次数（缓存的旧值个数），默认值为: 1 |
| windowTime | number | 多久之前的值可以记录（毫秒） |

| Return | Description |
| --- | --- |
| [IEventHandler](#IEventHandler) | 事件句柄 |

## 操作符（operators）
#### rxEmit\<T, R\>(event: IEvent\<R\>, payload?: (value: T) => R): MonoTypeOperatorFunction\<T\>
> 将消息发送给指定的事件

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |
| payload | Function | 消息数据 |

```ts
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { createReplayEvent, rxEmit } from 'rx-event-hub';

// 自定义事件
const events = {
  login$: createReplayEvent<string>()
};

// 订阅 LOGIN 事件
events.login$.on((message) => {
  // 输出: 'The role Admin logined'
  console.log(`${message} logined`);
});

// 发布 LOGIN 事件
timer(2000)
  .pipe(map(() => 'Admin'))
  .pipe(rxEmit(events.login$, (x) => `The role ${x}`))
  .subscribe((x) => {
    // 输出: 'Admin'
    console.log(x);
  });
```

## 装饰器
#### rxObs\<T\>(event: IEvent\<T\>): PropertyDecorator
> 属性修饰符：更改当前属性为一个 Observable 对象

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |

| Return | Description |
| --- | --- |
| Observable | 待订阅的对象 |

```ts
import { Observable } from 'rxjs';
import { createEvent, createReplayEvent, rxObs } from 'rx-event-hub';

// 全局事件
const EVENTS = {
  LOGIN: Symbol.for('LOGIN'),
  LOGOUT: Symbol.for('LOGOUT')
};

// 自定义事件
const events = {
  login$: createReplayEvent<string>(),
  logout$: createEvent()
};

class TestComponent {
  user: string;

  @rxObs(EVENTS.LOGIN)
  login$: Observable<string>;

  @rxObs(EVENTS.LOGOUT)
  logout$: Observable<string>;

  @rxObs(events.login$)
  login2$: Observable<string>;

  @rxObs(events.logout$)
  logout2$: Observable<string>;
}

const test = new TestComponent();

// 订阅
test.login$.subscribe((user) => {
  console.log(user);
});
```

#### rxOn\<T, R extends (...args: any[]) => any\>(event: IEvent\<T\>): MethodDecorator
> 函数修饰符，将该函数添加到指定事件的观察者列表，事件触发后，该函数将会执行

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |

#### rxOne\<T, R extends (...args: any[]) => any\>(event: IEvent\<T\>): MethodDecorator
> 函数修饰符，将该函数添加到指定事件的观察者列表，事件触发后，该函数将仅会执行一次

| Param | Type | Description |
| --- | --- | --- |
| event | [IEvent](#IEvent) | 事件 |

## 在 Angular 中使用

```ts
import { Observable, of } from 'rxjs';
import { scan } from 'rxjs/operators';
import { rxEmit, rxObs } from 'rx-event-hub';

const EVENT = Symbol.for('LOAD_ITEMS');

class TestComponent {
  @rxObs(EVENT)
  items$: Observable<any[]>;
}

const test = new TestComponent();

let items = [];

test.items$.subscribe((_items) => {
  items = _items;
});

// 依次输出三个值，并在之后的 scan 操作符中将其转换为数组，最后经过 map 发送到 items$
of('1', '2', '3')
  .pipe(
    scan((prev, cur) => {
      prev.push(cur);
      return prev;
    }, []),
    rxEmit(EVENT, (x) =>
      x.map((y) => ({
        title: y
      }))
    )
  )
  .subscribe({
    complete() {
      // 输出: [ { title: '1' }, { title: '2' }, { title: '3' } ]
    }
  });
```

```html
<li *ngFor="let item of items$ | async">{{ item.title }}</li>
```

## 结合 [vue-rx](https://github.com/vuejs/vue-rx) 在 Vue(2.x) 中使用
> 示例：在文本框输入，实时在底部显示格式后的字符

```ts
import { pluck } from 'rxjs/operators';
import { rxEmit, RxEventHub } from 'rx-event-hub';

const EVENT = Symbol.for('INPUT');

const app = new Vue({
  el: '#app',
  subscriptions() {
    return {
      input$: this.$fromDOMEvent('input', 'keyup').pipe(
        pluck('target', 'value'),
        rxEmit(EVENT, (text) => {
          return `User input ${text}`;
        })
      ),
      message$: RxEventHub.obs(EVENT)
    }
  }
});
```

```html
<div class="flex flex-items-center p-5 mb-6 border-4 border-indigo-600">
  <div>输入：</div>
  <input type="text" class="leading-7"/>
</div>
<div class="flex flex-items-center p-5 border-4 border-indigo-600">
  <div>接收：</div>
  <div>{{ message$ }}</div>
</div>
```

## Types

#### IEventName
> 事件名
```ts
type IEventName = string | symbol;
```

#### IEventHandler
> 自定义事件句柄
```ts
interface IEventHandler<T> {
  obs: () => Observable<T>;
  emit: (payload?: T) => void;
  on: (observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void) => Subscription;
  one: (observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void) => Subscription;
}
```

#### IEvent
> 事件类型
```ts
type IEvent<T> = IEventName | IEventHandler<T>;
```

