# CCTV

Веб-приложение на <b>[Bun](https://bun.com/)</b> и <b>[React](https://react.dev/)</b> для систем умного дома.

## Особенности

- Объединение камер в группы
- Вход и регистрация на смартфонах по QR коду
- Чат-бот Telegram для управления
- Работает с <b>[MediaMTX](https://github.com/bluenviron/mediamtx)</b>
- Для участников: установка имени и аватара, просмотр сессий

## Запуск

Предварительно необходимо установить и запустить сервис MediaMTX

```bash
$ scp -r ./ admin:pass@server:/opt/cctv
cd api
bun i
cd ../bot
bun i
```

### Команды бота
```bash
/crgrp название - создание группы
/jngrp id_группы id_пользователя имя_участника - ручное добавление в группу (для Telegram)
/invitel id_группы - создать приглашение, сгенерирует QR код
/delusr id_пользователя - удалит группу
/addcm id_группы название_камеры данные_конфига
/delcm id_камеры
/guser id_пользователя
/gusers, /ggr, /gcams, /ggu
/patch - запросы к базе данных (internal)
```

## Разработка
1. Для локальной разработки нужно поднять <b>[nginx](https://nginx.org/)</b> с самоподписанным SSL-сертификатом, пример конфига:
```nginx
server {
    listen 5000 ssl;
    server_name _;
    
    ssl_certificate     /etc/ssl/certs/localhost.crt;
    ssl_certificate_key /etc/ssl/certs/localhost.key;
    
    location / {
        if ($request_method = OPTIONS) {
                add_header Access-Control-Allow-Origin 'http://localhost:5173' always;
                add_header Access-Control-Allow-Credentials 'true' always;
                add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS, PATCH' alway>
                add_header Access-Control-Allow-Headers 'authorization, content-type' always;
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
        }
        
        add_header Cache-Control "no-cache";
        add_header Access-Control-Allow-Origin "http://localhost:5173";
        add_header Access-Control-Allow-Credentials 'true';
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        add_header Access-Control-Allow-Headers 'authorization, content-type';
        proxy_pass http://localhost:3033/;
        proxy_set_header Host $host;
    }
}
```
2. Сгенерируйте токен доступа для бота (убрав комментарии в index.js для 1 запуска)
3. Укажите токен в `bot/.env`
4. Укажите ссылки и ссылку для параметра cookie в `api/.env`

`api/.env`
```env
SECRET=случайная_длинная_строка
HLS_PATH=https://mediamtx.domain.com/
COOKIE_DOMAIN=.domain.com
```

`bot/.env`
```env
BOT_TOKEN=токен_телеграм
SECRET=токен_доступа_API
API_ROOT=https://api.domain.com/
```

## В планах

- Восстановление пароля и вход с 2FA
- Создание и контроль приглашений
- Комплексная защита от DDoS
- Светлая тема

## О проекте

Написано с нуля для личного пользования. На разработку ушло около месяца.

Вебдизайн спроектирован мною, реализован Gemini 2.5 Pro
