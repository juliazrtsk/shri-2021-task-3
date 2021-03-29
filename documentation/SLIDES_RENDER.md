# Порядок создания слайдов
Для каждого слайда

|#|Файл|Функция|Что происходит|
|---|---|---|---|
|0|index.ts|stories.map()|Вызов функции initIframe для каждого слайда. Результат - массив отрендеренных фреймов (по шаблону frame.html)|
|1|view.ts|initIframe|Создаётся фрейм. К нему добавляется event listener на событие 'load'. Фрейм добавляется в плеер|
||||
|2|index.ts|createCurrentDataSelector.subscribe()|Точно не ясно, но в том числе: отправка сообщения message@UPDATE для каждого слайда во фрейм. При этом, фрейм это сообщение пока никак обработать не может|
|3|index.ts|createThemeSelector.subscribe()|Точно не ясно, но в том числе: отправка сообщения message@SET_THEME для каждого слайда во фрейм. При этом, фрейм это сообщение пока никак обработать не может|
||||
|-|frame.ts|-|Добавляются event listener-ы для DOMContentLoaded, click, message|
||||
|4|frame.ts|ready()|Срабатывает событие DOMContentLoaded во фрейме. Срабатывает его event listener - функция ready, которая отправляет сообщение 'load'|
|5|frame.ts|receiveMessage()|(window.addEventListener('message,..) Срабатывает событие 'message' у фрейма (т.к. на прошлом шаге он в себя послал сообщение). Сообщение: 'load'. if не находит нужный тип, ничего не происходит|
|6|index.ts|onLoad, переданный при создании фрейма|Срабатывает на сообщение 'load'. Вызывается отправка сообщения message@UPDATE в iframe|
|7|view.ts|sendMessage()|Сообщение отправлено|
|8|index.ts|onLoad|К фрейму (iframe.contentWindow) добавляется обработчик onMessage события 'message'|
|9|frame.ts|receiveMessage()|Фрейм получает событие message@UPDATE с данными слайда. В этот раз проходит проверку и рендерит слайд (window.renderTemplate()). Код добавляется в тег body фрейма|
|10|index.ts|onMessage()|Эта функция триггерится на получение фреймом сообщения message@UPDATE. Ничего не происходит, т.к. обработка только для типа message@ACTION|
|11|frame.ts|receiveMessage()|Фрейм получает сообщение {type:'webpackOk', data:undefined}|
|12|index.ts|onMessage()|Опять триггерится и ничего не происходит|

Вывод
- Функция `renderTemplate` вызывается с верными данными и отдаёт верную разметку, ошибки нет.
- Скорее всего трабл где-то в `createCurrentDataSelector`.
  Там фигурирует index слайда, а это наводит на мысль, что ~эта штука отвечает за их смену. Копать сюда


## Сообщения для фреймов

### Load
```
'load'
```
### Update

```json
{
  "type": "message@UPDATE",
  "alias": "slide1", 
  "data": { "color": "green" }
}
```

### Theme
```json
{
  "type": "message@SET_THEME",
  "theme": "light" или "dark"
}
```
Вызывается `setElementTheme`, которая выставляет body фрейма класс theme_light или theme_dark

Класс темы также выставляется и плееру.
Фрейм рендерит стили слайда, а плеер стили кнопок.

### Action

```json
{
  "type": "message@ACTION",

}
```
