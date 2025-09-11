# Используем официальный образ Bun
FROM oven/bun:1.0-alpine AS base
WORKDIR /app

# Копируем файлы зависимостей ОТДЕЛЬНО от кода
COPY package.json bun.lockb ./
# Устанавливаем зависимости в отдельный слой (кешируется)
RUN bun install --frozen-lockfile --production

# Копируем ВСЕ исходники (используется .dockerignore для контроля)
COPY . .

# Указываем команду по умолчанию (будет переопределена в docker-compose)
CMD ["bun", "run", "start"]
