<div align="center">

# Rostelecom TMS — Frontend

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Ant_Design-6-0170FE?style=for-the-badge&logo=antdesign&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>

</div>


## О проекте

Веб-интерфейс корпоративной системы управления тестированием. Покрывает полный рабочий процесс QA-команды: ведение тест-кейсов, планов и запусков, просмотр статистики и AI-анализ дефектов.

> Бэкенд находится в репозитории [rostelecom-tms-backend](../rostelecom-tms-backend)

---

## Стек

| | Технология |
|---|---|
| **Язык** | TypeScript 5.9 |
| **UI-фреймворк** | React 19 |
| **Сборщик** | Vite 7 (SWC) |
| **Компоненты** | Ant Design 6 |
| **Роутинг** | React Router 7 |
| **Серверный стейт** | TanStack Query v5 |
| **HTTP-клиент** | Axios |
| **Графики** | Recharts |
| **Веб-сервер (prod)** | nginx |

---

### Навигация

| Маршрут | Страница |
|---------|----------|
| `/dashboard` | Сводный дашборд со статистикой и графиками |
| `/projects` | Список проектов, запросы на вступление |
| `/plans` | Тест-планы: список, создание, редактирование |
| `/cases` | Тест-кейсы: дерево групп, создание, редактирование |
| `/runs` | История запусков тест-планов |
| `/defects` | Реестр дефектов с AI-анализом |
| `/users` | Управление пользователями _(только admin)_ |
| `/account` | Профиль текущего пользователя |

---

## Быстрый старт

Запуск всего стека производится из репозитория бэкенда. Инструкции — в [rostelecom-tms-backend](../rostelecom-tms-backend#быстрый-старт).

Кратко:

```bash
# 1. Убедись, что оба репозитория склонированы рядом
# 2. Заполни .env в папке бэкенда
# 3. Из папки бэкенда:
docker compose -f compose.prod.yaml up -d
```

Приложение доступно на `http://localhost`.

---



## Импорт / Экспорт

Поддерживается экспорт тест-кейсов и тест-планов — данные выгружаются в стандартизированный формат для переноса между проектами или резервного копирования.

<!-- TODO: импорт в разработке, раздел будет дополнен -->

> [!IMPORTANT]
> Импорт находится в разработке и будет добавлен в ближайшее время.
