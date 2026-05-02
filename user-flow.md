# User flow приложения

Диаграмма построена по роутингу (`src/app/App.tsx`), навигации (`AuthorizedLayout`) и формам авторизации.

```mermaid
flowchart TD
  Start([Открытие приложения / любой URL]) --> CheckAuth{Сессия загружается?}
  CheckAuth -->|Да| Loader[Экран загрузки]
  CheckAuth -->|Нет| Known{Известный маршрут?}

  Known -->|Нет *| Fallback{Авторизован?}
  Fallback -->|Да| Screening["/screening"]
  Fallback -->|Нет| Login["/login"]

  Known -->|Да| GuestBranch{Гостевой маршрут<br/>/login или /register?}
  GuestBranch -->|Да| GuestAuth{Уже авторизован?}
  GuestAuth -->|Да| Screening
  GuestAuth -->|Нет| GuestPage[Страница логина или регистрации]

  Known -->|Защищённый маршрут| ProtAuth{Авторизован?}
  ProtAuth -->|Нет| Login
  ProtAuth -->|Да| Layout[AuthorizedLayout + сайдбар]

  Layout --> Screening
  Layout --> PredList["/predictions<br/>Список предсказаний"]
  PredList --> PredDetail["/predictions/:id<br/>Детали предсказания"]
  PredDetail -->|Кнопка назад| PredList

  GuestPage --> LoginFlow[Вход: успех]
  LoginFlow --> Screening

  GuestPage --> RegFlow[Регистрация: успех]
  RegFlow --> Login

  Login <-->|Ссылки| Register["/register"]

  Screening <-->|Навигация в сайдбаре| PredList
```

## Краткая сводка

| Событие | Куда ведёт |
|--------|------------|
| Успешный вход | `/screening` |
| Успешная регистрация | `/login` |
| Защищённая страница без сессии | `/login` |
| Гость с сессией на `/login` или `/register` | `/screening` |
| Неизвестный URL | `/screening` или `/login` в зависимости от авторизации |
