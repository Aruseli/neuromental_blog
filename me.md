# Проект личного блога (PWA)

## Выбранные технологии

### Фронтенд
- **React** - основная библиотека
- **Next.js** - фреймворк (обсуждаем App Router vs Pages Router)
- **Tailwind CSS** - стилизация
- **Shadcn/ui** - компоненты UI на основе Tailwind

### Редактор и макет блога
- **TipTap** - WYSIWYG редактор с возможностью интеграции AI-функций
- **React Grid Layout** - гибкая сетка для настройки расположения элементов

### Хранение данных
- **Hasura** - GraphQL API поверх PostgreSQL

### Авторизация
- **NextAuth.js** с кастомной интеграцией WebAuthn для биометрической аутентификации
- Поддержка авторизации через GitHub как альтернативный метод

### Интеграция с соцсетями
- Прямая интеграция с API (VK, Thread, Telegram)
- Собственная реализация агрегатора публикаций
- Адаптация контента под форматы разных соцсетей
- Отслеживание статуса публикаций в разных платформах

## Обсуждение технических вопросов

### Hasura в проекте
Hasura - отличный выбор для работы с GraphQL API. Преимущества:
- Автоматическая генерация GraphQL API на основе схемы PostgreSQL
- Реализация авторизации и разграничения прав на уровне БД
- Подписки для получения обновлений в реальном времени
- Возможность добавления кастомной бизнес-логики через Actions и Remote Schemas

Для интеграции Hasura в проект:
1. Развернуть Hasura Cloud (бесплатный тир) или локально через Docker
2. Подключить PostgreSQL базу данных
3. Определить схему данных (таблицы, отношения)
4. Настроить правила доступа и авторизацию
5. Использовать Apollo Client или urql на фронтенде для взаимодействия с API

### Next.js: App Router vs Pages Router
**App Router (Next.js 13+)**:
- Серверные компоненты по умолчанию (улучшают производительность)
- Улучшенная маршрутизация с вложенными лейаутами
- Параллельная загрузка данных
- Встроенный SEO через метаданные
- Оптимизированная работа с изображениями и шрифтами

**Pages Router (классический подход)**:
- Более простой и понятный для новичков
- Больше готовых примеров и решений
- Стабильнее, так как существует дольше

**Рекомендация**: использовать App Router, так как:
- PWA требует хорошей производительности
- Серверные компоненты уменьшают размер JS-бандла
- Удобнее работать с вложенными маршрутами (для админки, блога)
- Лучшая поддержка в будущем от Next.js

### Next.js vs Vite
**Next.js**:
- Полноценный фреймворк с серверным рендерингом
- Встроенная оптимизация изображений и шрифтов
- Готовые решения для маршрутизации и API
- Лучше для SEO благодаря SSR/SSG

**Vite**:
- Быстрый инструмент сборки, но не фреймворк
- Требует дополнительных библиотек для маршрутизации (React Router)
- Нет встроенного серверного рендеринга
- Быстрая разработка, но меньше оптимизаций для продакшена

**Рекомендация**: для PWA блога лучше использовать Next.js, так как:
- Важна SEO-оптимизация для блога
- Нужны API-роуты для интеграции с соцсетями
- Требуется оптимизация изображений для постов
- Серверные компоненты улучшат производительность

### Авторизация: NextAuth.js + WebAuthn

**Выбранное решение**: NextAuth.js с кастомной интеграцией WebAuthn

**Преимущества**:
- Полностью бесплатное и open-source решение без ограничений
- Гибкая настройка и возможность кастомизации
- Хорошая интеграция с Hasura через JWT
- Поддержка биометрической аутентификации (FaceID, TouchID, FingerPrint) через WebAuthn
- Возможность добавления GitHub как альтернативного метода авторизации

**Решенные проблемы интеграции NextAuth с Hasura**:
1. Проблема с JWT токеном: исправлен формат JWT токена для Hasura, который ожидает стандартный JWT токен с тремя частями (header.payload.signature)
2. Решение: использована библиотека jsonwebtoken для правильной генерации JWT токена вместо простого JSON.stringify
3. Настроена передача JWT токена в заголовке Authorization для запросов к Hasura
4. Добавлены необходимые claims для Hasura в JWT токен, включая роли пользователя

**Реализация WebAuthn**:
- Использование библиотек `@simplewebauthn/server` и `@simplewebauthn/browser`
- Создание кастомного провайдера для NextAuth.js
- Хранение учетных данных пользователей в базе данных PostgreSQL
- Возможность использования двухфакторной аутентификации (2FA)

**Процесс авторизации**:
1. Регистрация устройства пользователя (создание учетных данных WebAuthn)
2. Авторизация через биометрию устройства
3. Выдача JWT токена для доступа к защищенным ресурсам
4. Интеграция с Hasura для контроля доступа к данным

## Структура проекта (App Router)
```
/app
  /api - API роуты
    /auth - NextAuth.js и WebAuthn
    /social - интеграция с соцсетями
    /posts - управление постами
  /(auth) - защищенные роуты авторизации
  /(dashboard) - личный кабинет (защищенный)
    /posts - управление постами
      /editor - редактор с сеткой
      /[id] - редактирование конкретного поста
    /analytics - аналитика по соцсетям
    /schedule - календарь публикаций
    /settings - настройки и интеграции
  /(public) - публичная часть
    /blog - блог с сеткой постов
    /blog/[slug] - страница отдельного поста
    /contact - контакты
    /subscribe - форма подписки

/components
  /ui - базовые UI компоненты (Shadcn)
  /editor - компоненты редактора
    /blocks - типы блоков для сетки
    /grid - компоненты сетки
    /tiptap - настройки TipTap
  /layout - компоненты макета
  /social - компоненты для соцсетей

/lib
  /hasura - клиент и запросы GraphQL
  /auth - настройка авторизации и WebAuthn
  /editor - утилиты редактора
  /social - интеграции с соцсетями
  /utils - общие утилиты

/public - статические файлы
```

## Схема данных для Hasura/PostgreSQL

### Таблицы

#### users
- `id`: uuid, primary key
- `name`: text, имя пользователя
- `email`: text, уникальный email
- `image`: text, ссылка на аватар
- `created_at`: timestamp
- `updated_at`: timestamp

#### webauthn_credentials
- `id`: uuid, primary key
- `user_id`: uuid, foreign key -> users.id
- `credential_id`: text, уникальный ID учетных данных WebAuthn
- `public_key`: text, публичный ключ
- `counter`: integer, счетчик использования
- `created_at`: timestamp

#### posts
- `id`: uuid, primary key
- `author_id`: uuid, foreign key -> users.id
- `title`: text, заголовок поста
- `slug`: text, уникальный URL-дружелюбный идентификатор
- `excerpt`: text, краткое описание
- `cover_image`: text, ссылка на обложку
- `status`: text (draft, published, scheduled), статус публикации
- `layout_json`: jsonb, структура сетки для React Grid Layout
- `created_at`: timestamp
- `updated_at`: timestamp
- `published_at`: timestamp, дата публикации
- `scheduled_at`: timestamp, запланированная дата публикации

#### post_blocks
- `id`: uuid, primary key
- `post_id`: uuid, foreign key -> posts.id
- `type`: text (text, image, gallery, video, quote, code, etc.), тип блока
- `content`: jsonb, содержимое блока
- `grid_id`: text, идентификатор в сетке
- `created_at`: timestamp
- `updated_at`: timestamp

#### social_accounts
- `id`: uuid, primary key
- `user_id`: uuid, foreign key -> users.id
- `platform`: text (vk, telegram, thread), платформа
- `access_token`: text, токен доступа
- `refresh_token`: text, токен обновления
- `token_expires_at`: timestamp
- `platform_user_id`: text, ID пользователя на платформе
- `created_at`: timestamp
- `updated_at`: timestamp

#### social_publications
- `id`: uuid, primary key
- `post_id`: uuid, foreign key -> posts.id
- `social_account_id`: uuid, foreign key -> social_accounts.id
- `status`: text (pending, published, failed), статус публикации
- `external_url`: text, ссылка на публикацию в соцсети
- `external_id`: text, ID публикации в соцсети
- `published_at`: timestamp
- `scheduled_at`: timestamp
- `error_message`: text, сообщение об ошибке при публикации
- `created_at`: timestamp

#### social_stats
- `id`: uuid, primary key
- `publication_id`: uuid, foreign key -> social_publications.id
- `views`: integer, количество просмотров
- `likes`: integer, количество лайков
- `comments`: integer, количество комментариев
- `shares`: integer, количество репостов
- `collected_at`: timestamp

#### subscribers
- `id`: uuid, primary key
- `email`: text, email подписчика
- `name`: text, имя подписчика
- `status`: text (active, unsubscribed), статус подписки
- `created_at`: timestamp
- `updated_at`: timestamp

### Отношения
- users 1:N webauthn_credentials
- users 1:N posts
- users 1:N social_accounts
- posts 1:N post_blocks
- posts 1:N social_publications
- social_accounts 1:N social_publications
- social_publications 1:N social_stats

## Интеграция с социальными сетями

### Архитектура интеграции
Для интеграции с социальными сетями создана следующая структура:

#### Библиотека lib/social
- **types.ts** - типы данных и интерфейсы для всех компонентов
- **adapter.ts** - базовый адаптер и фабрика адаптеров
- **vk-adapter.ts** - адаптер для ВКонтакте (VK API)
- **telegram-adapter.ts** - адаптер для Telegram (Telegram Bot API)
- **thread-adapter.ts** - адаптер для Thread (Instagram Graph API)
- **social-service.ts** - сервис для работы с соцсетями

#### API-эндпоинты
- **/api/social/accounts** - управление аккаунтами (подключение, отключение)
- **/api/social/publish** - публикация контента в соцсети
- **/api/social/stats** - получение статистики публикаций

### Основные компоненты

#### Интерфейс SocialPlatformAdapter
Единый интерфейс для всех социальных платформ, позволяющий легко добавлять новые платформы:
```typescript
export interface SocialPlatformAdapter {
  connect(code: string): Promise<SocialAccount>;
  publish(account: SocialAccount, content: AdaptedContent): Promise<PublishResult>;
  getStats(publication: SocialPublication): Promise<SocialStats>;
  refreshToken(account: SocialAccount): Promise<SocialAccount>;
}
```

#### Базовый класс BaseSocialAdapter
Абстрактный класс, реализующий общую логику для всех адаптеров:
- Проверка валидности токена
- Обработка ошибок
- Базовые методы для всех платформ

#### Фабрика SocialAdapterFactory
Фабрика для создания и получения адаптеров для разных платформ:
- Регистрация адаптеров
- Получение адаптера по имени платформы

#### Сервис SocialService
Основной сервис для работы с социальными сетями:
- Подключение аккаунтов
- Публикация контента
- Получение статистики
- Адаптация контента под разные платформы

### Особенности реализации
- Адаптация контента под форматы разных соцсетей (длина текста, форматирование)
- Отслеживание статуса публикаций
- Обработка ошибок при публикации
- Обновление токенов доступа при необходимости
- Сбор статистики по публикациям

## Настройка Hasura и схемы данных

### Локальная разработка

Для локальной разработки настроен Docker с помощью docker-compose:

1. **PostgreSQL**:
   - Версия: 15
   - База данных: myblog
   - Пользователь: postgres
   - Порт: 5432

2. **Hasura GraphQL Engine**:
   - Версия: v2.30.1
   - Порт: 8080
   - Настроен JWT для авторизации
   - Добавлена роль anonymous для неавторизованного доступа

### Продакшн окружение

Для продакшн окружения выбраны следующие сервисы:

1. **Hasura Cloud**:
   - Бесплатный тир для размещения GraphQL API
   - Автоматическое масштабирование
   - Встроенный мониторинг

2. **Vercel**:
   - Размещение Next.js приложения
   - Автоматический деплой из GitHub
   - Глобальная CDN сеть

### Интеграция NextAuth с Hasura

Для интеграции NextAuth с Hasura настроен JWT токен со следующими параметрами:

1. **JWT Claims для Hasura**:
   ```json
   {
     "https://hasura.io/jwt/claims": {
       "x-hasura-allowed-roles": ["user", "anonymous"],
       "x-hasura-default-role": "user",
       "x-hasura-user-id": "token.id"
     }
   }
   ```

2. **Настройки в NextAuth**:
   - Добавлены функции `encode` и `decode` для JWT
   - Добавлено поле `role` в JWT токен
   - Срок действия токена установлен на 30 дней

### Apollo Client для работы с GraphQL

Для работы с Hasura GraphQL API настроен Apollo Client:

1. **Основные компоненты**:
   - Клиент с поддержкой SSR
   - Обработка ошибок
   - Автоматическая авторизация через JWT

2. **GraphQL запросы**:
   - Фрагменты для повторного использования
   - Запросы для всех основных сущностей
   - Мутации для создания, обновления и удаления данных

## Следующие шаги
1. Настроить базовый проект Next.js с App Router ✅
2. Интегрировать Tailwind CSS и Shadcn/ui ✅
3. Реализовать базовую авторизацию с NextAuth.js ✅
4. Реализовать интеграцию с соцсетями ✅
5. Настроить Hasura и определить схему данных ✅
6. Создать редактор с TipTap и React Grid Layout
7. Интегрировать WebAuthn для биометрической аутентификации
8. Создать базовые компоненты UI и лейауты
9. Настроить деплой на Vercel и Hasura Cloud
