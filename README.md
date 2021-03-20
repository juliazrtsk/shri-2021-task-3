# Найденные ошибки

## Шаблон
* Какая ошибка
* Как обнаружилась
* Почему она возникла
* Какие способы исправления существуют

## 1
```bash
ERROR in /Users/zrtsk/dev/yandex/shri-2021/shri-2021-task-3/src/application/data.ts
./src/application/data.ts
[tsl] ERROR in /Users/zrtsk/dev/yandex/shri-2021/shri-2021-task-3/src/application/data.ts(46,14)
      TS2678: Type '"update"' is not comparable to type '"message" | "next" | "prev" | "restart" | "theme" | "timer"'.
 @ ./src/application/state.ts 15:0-30 29:15-19
 @ ./src/index.ts 3:0-50 8:9-20
```

Ошибка появилась в консоли при запуске приложения.
Переменные типа Action (`src/application/actions.ts`) содержат в себе поле `type`, которое должно принимать одно из строковых значений:
`'next', 'prev', 'restart', 'message', 'theme', 'timer', 'update'`.

Суть ошибки: значение 'update' не было добавлено в возможные значения поля type в Action.
Однако, это значение требовалось в функции data (`src/application/data.ts`).

Исправила, добавив строку `| ReturnType<typeof actionUpdate>` в тип Action.
