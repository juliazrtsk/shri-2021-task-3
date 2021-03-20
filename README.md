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

## 2
```bash
WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets:
  index.e64746b1.js (252 KiB)

WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
Entrypoints:
  index (257 KiB)
      index.css
      index.e64746b1.js

WARNING in webpack performance recommendations:
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/
```

Подобные ворнинги появлялись в консоли сборке проекта (`npm start` или `npm run build`).
Вебпак ругался на неоптимизированную сборку, а именно — большие размеры файлов.
Причины:
1. Для Webpack не указан mode: 'none', 'development' или 'production' ([link](https://webpack.js.org/configuration/mode/)).
   Автоматически в mode выставлялось значение 'production', об этом первый ворнинг.
2. Ворнинги насчёт размера файлов появлялись из-за сочетания mode: 'production' и содержания в файлах inline-source-map.

Можно разделить один конфиг Webpack на два (webpack.development.config.js и webpack.production.config.js).
Я решила сохранить общий конфиг и добавить env-переменную.

Изменила npm скрипты:
```json
{
  "build": "webpack --env production",
  "start": "webpack serve --open --env development"
}
```
В конфиге Webpack сделала настройку mode и devtool в зависимости от прокинутой переменной.
Теперь в prod-версию не помещается source map
```js
module.exports = (env) => {
  const dev = env.development;
  return {
    mode: dev ? 'development' : 'production',
    devtool: dev ? 'inline-source-map' : false,
    ...
  }
}
```

И дополнительно: заметила, что в prod-сборку css файлы помещались с сохранённым форматированием. Это тоже отражается на размере файлов.
Поэтому добавила минификацию с помощью плагина `css-minimizer-webpack-plugin`.
```js
optimization: {
    minimize: prod,
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  }
```

## 3
Кнопка переключения темы пропадает после первого нажатия.

В процессе копания оказалось, что переключают темы две разные кнопки:
- **set-dark** включает тёмную тему;
- **set-light** включает светлую тему.

Когда переключается тема, соответствующая кнопка должна пропасть (ей выставляется стиль `display: none`), а противоположная должна появиться на том же месте.

Причина отсутствующей кнопки set-light заключалась в том, что при переключении темы на тёмную
1. К тегу `<body>` добавлялся класс `theme_dark`.
2. И при этом не исчезал класс `theme_light`.

Получалась ситуация
```html
<body class="theme_light theme_dark">
```
Из-за порядка классов стили тёмной версии применялись верно: цвета заменялись.
Но при этом действовал и стиль
```css
.theme_light .set-light {
   display: none;
}
```

Функция `setElementTheme` (`src/application/view.ts`) добавляла класс выбранной темы ко всему списку классов, не проверяя, задана ли уже какая-нибудь тема.
```js
elem.classList.add(`theme_${theme}`);
```
Первый вариант решения, который пришёл в голову: простая проверка if-ом (если есть класс противоположной темы, убирать его).
Однако, тем может быть больше, чем две. Поэтому решила убирать все классы, которые начинаются с `theme_`.
Это решение не зависит от количества тем.

