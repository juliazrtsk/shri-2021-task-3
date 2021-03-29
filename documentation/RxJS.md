Объекты RxJS Observable создаются либо с использованием операторов создания (of, from, fromEvent), либо через new Observable.

Каждый Observable может отправлять своим "потребителям" уведомления:
- next() - отправка данных, количество вызовов не ограничено;
- error() - генерация ошибки;
- complete() - завершение исполнения Observable.

Исполнение RxJS Observable начнется только после вызова у него метода subscribe()

Для предварительного преобразования отправляемых объектом Observable данных или преобразования и управления самими Observable используются специальные функции - операторы.
Операторы объединяются методом pipe

|Операторы / функции в проекте|Описание|
|---|---|
|of|Each argument becomes a next notification. `of(1,2,3) -> 1, 2, 3`|
|[withLatestFrom](https://rxjs.dev/api/operators/withLatestFrom)|what the fuck|
|interval|Emits incremental numbers periodically in time. `interval(1000)` - number every second|
|map|Passes each source value through a transformation function to get corresponding output values. `[1,2,3] -> map(x*2) -> [2,4,6]`|
|mapTo|Like map, but it maps every source value to the same output value every time. `[1,2,3] -> mapTo('a') -> ['a','a','a']`|
|[merge](https://rxjs.dev/api/index/function/merge)|Flattens multiple Observables together by blending their values into one Observable. `[1,  2], [  3,  4] -> merge -> [1, 3, 2, 4]`|
|[mergeMap](https://rxjs.dev/api/operators/mergeMap)|Maps each value to an Observable, then flattens all of these inner Observables using mergeAll|
|[margeMapTo](https://rxjs.dev/api/operators/mergeMapTo)|It's like mergeMap, but maps each value always to the same inner Observable|
|[distinctUntilChanged](https://rxjs.dev/api/operators/distinctUntilChanged)|With comparator: tests each item (whether or not that value should be emitted). Without comparator: equality check. `[1,1,2,3,1,4] -> [1,2,3,1,4]`|

Константа [EMPTY](https://rxjs.dev/api/index/const/EMPTY)


## State
Subject является разновидностью объектов Observable.
Может отправлять данные одновременно множеству "потребителей",
которые могут регистрироваться уже в процессе исполнения Subject,
в то время как исполнение стандартного Observable осуществляется уникально для каждого его вызова.

BehaviorSubject хранит в себе последнее отправленное им значение.
Так, каждому новому обработчику в момент регистрации (вызов subscribe()) будет отправлено это значение.

Стейт приложения - BehaviorSubject
