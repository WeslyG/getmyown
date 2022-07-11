# GetMyOwn

Сервис для парсинга html любых сайтов, включая сайты с react и подобными библиотеками, не отдающими напрямую html.
Сервис открывает браузер, и запускает там веб страницу, полностью обладая всеми возможностями браузера.

[](media/demo.gif)

На самом деле это просто http обертка над playwright которая отдает по сети значение по селектору

### Для чего оно нужно?

Очень удобно следить за ценниками в магазине, ожидать акций и прочего

Также можно следить за появлением какой либо информации на странице (билеты на концерт, запись на мероприятие, обновление новостей и тд)

## Docker

Образы собраны для x86 (она же amd64) и для ARM архитектуры (raspberry pi /banana pi/rock pi etc)

- weslyg/getmyown-arm
- weslyg/getmyown-amd64

Команда запуска стандартная

```bash
docker run -d -p 3000:3000 --restart always --name getmyown weslyg/getmyown-amd64
```

Порт по умолчанию `3000`

## Home assistant

В Home Assistant можно использовать платформу REST для доступа к сервису.
Все что для этого нужно сделать - отправить POST запрос на порт с сервисом (по умолчанию 3000)

```yaml
- name: Яндекс подписка Dns
  platform: rest
  method: POST
  headers:
    User-Agent: Home Assistant
    Content-Type: application/json
  resource: http://10.0.0.7:3000?parseInt=true
  value_template: "{{ value_json.data }}"
  unit_of_measurement: "₽"
  scan_interval: 21600
  payload: '{ "url": "https://www.dns-shop.ru/product/ad05e5c642613332/karta-oplaty-dostupa-andeks-plus-na-12-mesacev/", "selector": ".product-buy__price >> nth=0"}'
```

установить getmyown на homeassistant можно через [рабочий аддон портейнера](https://github.com/MikeJMcGuire/hass-portainer) что даст доступ к docker на хосте.

После чего в портейнере, уже можно поднимать сервис, тогда в rest платформе, можно будет ходить на ip ноды с home assistant

## API

Проверить работу сервиса можно

```sh
curl localhost:3000
```

В ответ получаем

```json
{
  "message": "ok"
}
```

Значит все работает корректно

Отправить запрос на получение значений по селектору можно так

```
curl -XPOST localhost:3000/ -H "Content-Type: application/json" -d '{ "url": "https://www.dns-shop.ru/product/ad05e5c642613332/karta-oplaty-dostupa-andeks-plus-na-12-mesacev/", "selector": ".product-buy__price >> nth=0"}'
```

Формат приема данных

Метод - POST
Content-type: application/json

Body

```json
{
  "url": "string",
  "selector": "string"
}
```

Дополнительно, можно использовать Query Параметр, `parseInt=true` для получения только числового представления значения (убирает всякие значки рубля,и прочий мусор из значения)

Query параметр прописывается в Url

```
localhost:3000?parseInt=true
```

### Локальное тестирование

Протестировать селектор локально, можно открыв в браузере нужную страницу, и нажать f12

в консоль ввести

```js
document.querySelector("${SELECTOR}");
```

И если в результате у вас возвращается то, что ожидаете, то можно отправлять данный селектор в сервис.

**Имейте ввиду!** многие сайты имеют защиту от ddos и они быстро заблокируют ваш Ip компьютера капчей, которую данный сервис не обходит! Поэтому ставьте частоту опроса в ha например раз в 6 часов, или около того.

(не пытайтесь парсить яндекс маркет, отлетаете в бан через 3 запроса)

Почитать про css селекторы, если ничего про них не знаете [можно тут](https://developer.mozilla.org/ru/docs/Learn/CSS/Building_blocks/Selectors)

Почитать про детали [селекторов в playwright тут](https://playwright.dev/docs/selectors)

### Готовые селекторы для ретейла (могут поменяться в любой момент!)

- DNS = ".product-buy\_\_price >> nth=0"
- Eldorado = ".product-box-price\_\_active >> nth=0"
- Mvideo = ".price\_\_main-value >> nth=0"
