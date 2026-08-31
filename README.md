# GameStation

Игровой портал с двумя браузерными мини-играми против компьютера, личной статистикой,
общим лидербордом, отзывами об играх и прямой перепиской между игроком и администратором.

![Главная](docs/screenshots/01-home.png)

## Возможности

- **Аккаунты и роли.** Регистрация и вход по email и паролю, JWT-сессии, роли `USER` и `ADMIN`.
- **Крестики-нолики.** Поле от 3×3 до 8×8, игра против компьютера; сложность соперника
  переключается (блокирует и атакует либо играет спокойно). Победа засчитывается в статистику.
- **Камень-ножницы-бумага.** Матч до 3, 5 или 10 побед против компьютера с покадровым разбором раунда.
- **Лидерборд.** Таблица игроков по числу побед отдельно для каждой игры.
- **Профиль.** Личная статистика побед по играм.
- **Отзывы.** Публичный список отзывов об играх с фильтром по игре; авторизованный игрок оставляет свой.
- **Сообщения.** Ветка переписки игрока со службой поддержки; администратор отвечает по каждому игроку.
- **Администрирование.** Список игроков со счётом, переименование, смена роли, удаление,
  сброс счёта по игре, просмотр всех отзывов.

| Крестики-нолики | Камень-ножницы-бумага |
| --- | --- |
| ![Крестики-нолики](docs/screenshots/02-tic-tac-toe.png) | ![Камень-ножницы-бумага](docs/screenshots/03-rock-paper-scissors.png) |

| Лидерборд | Администрирование |
| --- | --- |
| ![Лидерборд](docs/screenshots/04-leaderboard.png) | ![Администрирование](docs/screenshots/08-admin.png) |

## Архитектура

Монорепозиторий на npm workspaces:

```
packages/shared   общие контракты (zod-схемы и типы) и чистая игровая логика
apps/api          HTTP API: Express + TypeScript + Prisma
apps/web          клиент: Vite + React + TypeScript
apps/e2e          Playwright smoke и desktop/mobile UI quality checks
```

Границы контрактов описаны один раз в `packages/shared` и используются и сервером, и клиентом:
запросы валидируются zod-схемами на сервере, ответы разбираются теми же схемами на клиенте.
Игровые движки (детект победы на поле N×N, разбор раунда «камень-ножницы-бумага») лежат
в `packages/shared/src/engine` и покрыты модульными тестами.

### API

| Метод | Путь | Доступ | Назначение |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | все | регистрация, роль всегда `USER` |
| `POST` | `/api/auth/login` | все | вход |
| `GET` | `/api/auth/me` | сессия | текущий пользователь |
| `POST` | `/api/scores/wins` | сессия | засчитать победу в игре |
| `GET` | `/api/scores/me` | сессия | мой счёт по играм |
| `GET` | `/api/leaderboard?game&limit` | все | таблица лидеров по игре |
| `GET` | `/api/reviews?game` | все | список отзывов |
| `POST` | `/api/reviews` | сессия | оставить отзыв |
| `GET` | `/api/messages` | сессия | моя ветка сообщений (для админа — по игроку) |
| `POST` | `/api/messages` | сессия | отправить сообщение |
| `GET` | `/api/users` | админ | список игроков со счётом |
| `PATCH` | `/api/users/:id` | админ | сменить email или роль |
| `DELETE` | `/api/users/:id` | админ | удалить игрока |
| `POST` | `/api/users/:id/scores/reset` | админ | обнулить счёт игрока в игре |
| `GET` | `/api/health` | все | состояние сервиса и БД |

Защита API: проверка переменных окружения на старте, Helmet, CORS по списку разрешённых
origin, ограничение размера тела запроса, rate-limit (общий и отдельно на вход и на запись
побед), валидация DTO с запретом неизвестных полей, единый обработчик ошибок без утечки
внутренних данных, сериализация ответов по белому списку полей (хеш пароля не отдаётся).

## Стек

- **API:** Node.js 20+, Express, TypeScript, Prisma (PostgreSQL), zod, jsonwebtoken, bcryptjs,
  Helmet, express-rate-limit, pino. Тесты — Vitest + Supertest.
- **Клиент:** React 18, TypeScript, Vite, React Router, TanStack Query, Zustand.
  Тесты — Vitest + Testing Library.
- **Сквозной тест:** Playwright.
- **Инфраструктура:** Docker Compose (PostgreSQL 16, API, статика через nginx).

## Требования

- Node.js 20–24 и npm 10+;
- PostgreSQL 16+ для локального API или Docker с Compose для готового стека;
- Chromium, установленный командой `npm run e2e:install`, для сквозных тестов.

## Переменные окружения

Корневой шаблон `.env.example` используется API и Docker Compose. Необязательные настройки
Vite находятся в `apps/web/.env.example`; копируйте их в `apps/web/.env`, только если нужно
изменить адрес dev-прокси или API.

| Переменная | Назначение |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | параметры контейнера PostgreSQL |
| `POSTGRES_PORT`, `WEB_PORT` | опубликованные порты PostgreSQL и nginx в Docker Compose |
| `DATABASE_URL` | строка подключения API к базе |
| `TEST_DATABASE_URL` | отдельная тестовая БД или схема; API-тесты откажутся очищать обычную БД |
| `NODE_ENV` | `development` / `test` / `production` |
| `API_PORT` | порт HTTP API (по умолчанию `4000`) |
| `JWT_SECRET` | секрет подписи JWT, не короче 32 символов |
| `JWT_EXPIRES_IN` | срок жизни токена (по умолчанию `24h`) |
| `BCRYPT_ROUNDS` | число раундов bcrypt (по умолчанию `12`) |
| `WEB_ORIGIN` | разрешённые origin для CORS, через запятую |
| `SEED_PASSWORD` | пароль учётных записей из seed-скрипта |
| `VITE_API_URL` | базовый URL API для клиента; пусто — dev-прокси Vite на `/api` |
| `API_PROXY_TARGET` | адрес API для dev-прокси Vite (по умолчанию `http://localhost:4000`) |

Для production задайте собственные `JWT_SECRET` и пароль базы — значения из `.env.example`
являются лишь заглушками.

## Быстрый старт через Docker Compose

```bash
cp .env.example .env
# задайте JWT_SECRET и POSTGRES_PASSWORD в .env
npm run docker:up
npm run docker:seed             # необязательно: добавить демонстрационные данные
```

- клиент — http://localhost:8080
- API — http://localhost:8080/api (и напрямую http://localhost:4000/api)

API при старте контейнера применяет миграции (`prisma migrate deploy`). Остановить стек:
`npm run docker:down`; данные PostgreSQL при этом сохраняются. Команда `npm run docker:reset`
дополнительно удаляет локальный volume с данными.

## Локальная разработка

```bash
npm ci
cp .env.example .env            # DATABASE_URL → localhost:5432
docker compose up -d db          # либо используйте существующий PostgreSQL

npm run db:migrate              # применить миграции к пустой базе
npm run db:seed                 # небольшой обезличенный набор данных

npm run dev                     # API на :4000, клиент на :5173
```

Аккаунты из seed (пароль — значение `SEED_PASSWORD`):

- `admin@gamestation.local` — роль `ADMIN`
- `nova@example.com`, `pixel@example.com`, `blitz@example.com`, `echo@example.com` — роль `USER`

## База данных

Схема описана в `apps/api/prisma/schema.prisma`, изменения оформляются миграциями в
`apps/api/prisma/migrations`. Неявное создание схемы не используется.

```bash
npm run db:migrate:dev         # создать и применить новую миграцию (разработка)
npm run db:migrate             # применить существующие миграции (prisma migrate deploy)
npm run db:seed                # заполнить демо-данными
npm run db:reset               # пересоздать базу и применить миграции заново
```

Модели: `User`, `Score` (пара «игрок + игра» с числом побед), `Review`, `Message`.

## Тесты

```bash
npm run typecheck              # строгая проверка типов во всех пакетах
npm run lint                   # ESLint
npm test                       # модульные тесты движков, API-тесты, компонентные тесты клиента
npm run e2e                    # smoke-сценарий и desktop/mobile UI quality checks
npm run build                  # production-сборка shared, API и web
git diff --check               # ошибки пробелов и конфликтные маркеры в diff
```

Для `npm test` нужна доступная отдельная `TEST_DATABASE_URL`. Имя БД или схемы должно содержать
`test`; это защищает обычные данные от очистки тестовыми фикстурами. Для `npm run e2e` должен быть
поднят стек (например, `npm run docker:up`) и установлен браузер: `npm run e2e:install`.

Playwright проверяет основной пользовательский путь, desktop/mobile viewport, загрузку локальных
изображений и favicon, ошибки консоли и сети, а также отсутствие горизонтального overflow.
Те же проверки запускаются в GitHub Actions для каждого pull request и изменения `main`.

## Production-сборка

```bash
npm ci
npm run build
npm run preview --workspace @gamestation/web
```

Собранный API запускается командой `npm run start --workspace @gamestation/api`; перед запуском
задайте production-переменные окружения и примените `npm run db:migrate`.

## Структура репозитория

```
apps/
  api/    Express + Prisma; модули auth, scores, reviews, messages, users, health
  web/    React-клиент; features по экранам, общие ui-компоненты, слой api
  e2e/    Playwright smoke и UI quality checks
packages/
  shared/ contracts (zod) + engine (tic-tac-toe, rock-paper-scissors)
docs/
  screenshots/  изображения для README
docker-compose.yml
```

## Лицензия

Проект распространяется по лицензии [MIT](LICENSE). Copyright © 2026 AlexKazDrumm.
