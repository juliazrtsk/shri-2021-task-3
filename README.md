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
Из-за порядка стилей в файле `index.css` стили тёмной темы применялись верно, и цвета заменялись
(специфичность селекторов для тёмной и светлой тем одинакова, поэтому в ситуации, когда элементу выставлены оба класса, применятся стили, которые идут последними в CSS-коде).

При этом действовал и код
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
Однако, тем может быть больше, чем две (в теории, можно расширить список). Поэтому решила убирать все классы, которые начинаются с `theme_`.
Это решение не зависит от количества тем.

## 4
Не показывался прогресс бар для автоматического переключения слайдов.
Причину случайно увидела в сборке, когда исправляла ворнинги от Webpack:
```css
.slide-progress-value {
    height: 4;
}
```
Пропущена единица измерения `px`.

## 5
На событие click по кнопке с классом next был навешан event listener, который диспатчил неправильный экшн (`actionPrev`).
Верная экшн был импортирован в файл, но не использовался (`actionNext`).

## 6
При высоте окна менее 750px исчезала одна кнопка `prev`.
Это показалось нелогичным, поэтому сделала так, чтобы исчезали все кнопки.
```css
@media (max-height: 750px) {
  .button {
    display: none;
  }
}
```

## 7
Дефолтная тема была светлой. В требованиях сказано, что она должна быть тёмной.

Исправила дефолтный класс в `index.html` и `frame.html`
```html
<body class="theme_dark">
```

А также в `DEFAULT_STATE` приложения
```js
const DEFAULT_STATE: State = {
  theme: 'dark',
  ...
};
```

Здесь же немного поправила цвет прогресс бара в светлой теме (чтобы не выбивался из code style).
```
#bfbfbf88 -> #BFBFBF88
```

## 8
```bash
frame.ts:25 Uncaught TypeError: Cannot read property 'dataset' of null
at HTMLBodyElement.<anonymous>
```

Ошибка возникала при клике на пустую область слайда.

Проблема была в обработчике события click у фрейма (`onDocumentClick`).
Если клик был совершён по какому-нибудь элементу внутри `<div data-...="..." >`, то в переменной target оказывался элемент DOM-дерева без data-атрибутов.
Тогда с помощью цикла происходит поиск родителя, у которого эти атрибуты есть.

Суть ошибки: не был обработан случай, когда родитель с data-атрибутами не найден.
При клике по свободному месту слайда поиск родителя был таким:
```
<div class="slide"> ->
    <body> ->
        <html> ->
            null
```
Когда получаем null, не можем получить его parentElement. Отсюда ошибка в консоли.

Добавила в условие цикла проверку на то, что мы добрались до `<div>` с классом `slide`.
```js
!target.classList.contains('slide')
```

После этой правки заметила, что если в target находится элемент без data-атрибутов, то во фрейм передаётся следующий message:
```js
{
  type: 'message@ACTION',
  action: undefined,
  params: undefined
}
```

Перед отправкой сообщения добавила проверку на то, что data-атрибут `action` существует
```js
action && sendMessage(messageAction(action, params));
```

## 9
Начальное состояние всех прогресс-баров -- "выполненное" (они жёлтые).

Заполнение прогресс бара реализовано через изменение свойства `transform: scaleX(...)`.
Это происходит в атрибуте `style`, а значит в index.css можно задать классу `slide-progress-value` начальное значение и это не приведёт к ошибке
(у стилей, объявленных в элементе, наивысшая специфичность).
```css
.slide-progress-value {
  ...
  transform: scaleX(0);
}
```

## 10
Слайды не переключались

Меняла местами данные, в браузере тыкала в айфреймы и смотрела, какие данные они содержат.

Этапы поиска решения:
1. Разобралась в том, как устроен плеер. Сначала продебажила и проконсольложила все экшены, прописала связь между экшенами и разными обработчиками. Мне легче думать, когда я пишу6 поэтому сделала [док](./documentation/SLIDES_RENDER.md).
**Вывод 1** после этого этапа: в функцию `renderTemplate` передаются верные данные, она без ошибок возвращает нужную разметку, слайды рендерятся. **Вывод 2**: проблема скорее всего в createCurrentDataSelector.
   
2. Изучение документации RxJS. Сделала для себя пометки о том, как работают операторы, которые есть в проекте. [Док](./documentation/RxJS.md)

Ошибка была вот тут: `/src/application/selectors.ts`
```js
export const createCurrentIndexSelector = (state$: Observable<State>) => state$.pipe(
    map(s => s.index), // 1
    distinctUntilChanged(),
    mergeMapTo(EMPTY), // 2
);
```
- (1) Создаём селектор, который должен отдавать номер текущего слайда, который хранится в стейте приложения
- (2) Observable маппим с EMPTY. Не уверена в терминологии, но, полагаю, это затирает переданный в шаге 1 callback- функцию, и ничего не происходит (слайд остаётся на месте).

Из-за этого не срабатывывала подписка на изменение индекса слайда в `src/index.ts`
```js
createCurrentIndexSelector(state$)
    .subscribe(index => { // Индекс нового слайда
        // Перелистывание слайда
        player.style.transform = `translateX(-${index * 100}%)`;
        bars.forEach((el, i) => setScale(el, i < index ? 1 : 0));
    });
```

## 11
После окончания просмотра слайдов ломается их смена.

Как воспроизвести:
- Долистать слайды до конца
- После завершения просмотра нажать `prev` или `restart`
- Прогресс бар нового слайда дойдёт до конца, но на следующий мы не перейдём

В процессе дебага оказалось, что перестаёт работать событие `next`.
В `src/application/data.ts` событие `next` обрабатывается таким образом,
что на последнем слайде в стейте приложения обновляетя поле pause:`draft.pause = true`.

#### Версия 1
Поле `pause` меняется некорректно.

#### Версия 2
При смене поля `pause` в стейте где-то происходит отписка от какого-нибудь события. И потом эта подписка не восстанавливается (при нажатии на prev или restart).

Обе версии проверила: смена поля `pause` происходит верно.

#### Версия 3
Заметила, что после завершения последнего слайда и смены значения `pause`
происходят несколько попыток подряд вызвать `next` (`src/application/effects.ts`)
```js
const changeSlideEffect$ = timerEffect$.pipe(
        withLatestFrom(state$),
        mergeMap(([a, s]) => s.progress >= DELAY ? of(actionNext()) : EMPTY),
        take(5),
    );
```
Не до конца поняла, как именно здесь работает `take(5)`. Если его убрать, событие `next` будет вызываться бесконечно
(потому что `s.progress` больше не меняется и всегда равен DELAY).
Поэтому, по ощущениям: `take(5)` выступает как ограничение на количество попыток вызвать `next`.
Причём, судя по тому, что потом вызов `next` совсем перестаёт работать - где-то происходит отписка.

В этом и была ошибка.

Так как я уже выяснила, что `pause` задаётся корректно, это можно было использовать
для исправления условия перелистывания слайда:
```js
s.progress >= DELAY && !s.pause
```
Теперь ограничение take не нужно
