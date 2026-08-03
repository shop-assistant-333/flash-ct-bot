# API контракт

Базовый префикс — `/api`. Формат — JSON, UTF-8.

## Аутентификация

Каждый запрос к `/api/**` обязан содержать заголовок:

```
X-Telegram-Init-Data: <window.Telegram.WebApp.initData>
```

Бэкенд проверяет подпись `initData` ботовым токеном, находит пользователя по `tg_id`
(при первом запуске — регистрирует) и кладёт его в контекст запроса. Отдельного логина,
токенов и refresh нет.

Роль возвращается в `GET /api/profile` → `role` (`USER` | `ADMIN`). Фронтенд по ней решает,
рисовать ли четыре студенческие вкладки или админ-панель. Ветка `/api/admin/**` дополнительно
проверяется на сервере и отдаёт 403 всем, кроме админа.

## Ошибки

Любой не-2xx ответ — одна и та же форма:

```json
{
  "code": "LESSON_LOCKED",
  "message": "Lesson 4 is not unlocked yet",
  "timestamp": "2026-08-02T16:40:11.201",
  "fields": { "title": "must not be blank" }
}
```

`fields` присутствует только при `VALIDATION_FAILED`. Ветвиться нужно по `code`, не по `message`.

| code | HTTP | когда |
|---|---|---|
| `UNAUTHORIZED` | 401 | нет заголовка, битая или просроченная подпись |
| `FORBIDDEN` | 403 | роли не хватает |
| `SUBSCRIPTION_EXPIRED` | 403 | предмет не оплачен или срок вышел |
| `LESSON_LOCKED` | 403 | предыдущий урок не пройден |
| `NOT_FOUND` | 404 | нет такой сущности |
| `VALIDATION_FAILED` | 400 | не прошла валидация тела запроса |
| `BAD_REQUEST` | 400 | нет обязательного параметра, неверный тип |
| `ATTEMPT_ALREADY_COMPLETED` | 409 | урок уже сдан |
| `QUESTION_ALREADY_ANSWERED` | 409 | на вопрос уже отвечали в этой попытке |
| `ATTEMPT_INCOMPLETE` | 409 | завершение при неотвеченных вопросах |
| `PRACTICE_DECK_EMPTY` | 404 | по предмету нет доступных вопросов для практики |
| `PREDICTION_UNAVAILABLE` | 503 | ИИ-прогноз не удалось получить |
| `INTERNAL_ERROR` | 500 | всё остальное |

---

## Жизненный цикл приложения

| метод | путь | ответ |
|---|---|---|
| `POST` | `/api/session/start` | `SessionDto` |
| `POST` | `/api/session/heartbeat` | 204 |
| `POST` | `/api/session/end` | 204 |

`start` — первый вызов мини-аппа. Регистрирует пользователя при первом запуске и возвращает
профиль, из которого рисуется навигация.

Сессия решает две задачи: считает часы в приложении для статистики и задаёт границу, на которой
пересобирается колода практики. `heartbeat` фронтенд шлёт по таймеру (~1 мин), пока приложение
открыто; сессия без heartbeat дольше `app.session.idle-timeout` (по умолчанию 15 мин) считается
закрытой. `end` — по событию закрытия из Telegram SDK, если оно пришло.

---

## Вкладка «ДЗ»

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/subjects` | `SubjectItem[]` |
| `GET` | `/api/lessons?subjectId={id}` | `LessonItem[]` |
| `POST` | `/api/lessons/{lessonId}/attempt` | `AttemptDto` |
| `GET` | `/api/attempts/{attemptId}` | `AttemptDto` |
| `POST` | `/api/attempts/{attemptId}/answers` | `AnswerResultDto` |
| `POST` | `/api/attempts/{attemptId}/complete` | `AttemptResultDto` |

Сценарий: `GET /api/subjects` даёт переключатель предметов (у студента может быть один или два).
`GET /api/lessons` — список плашек урока со статусом: `LOCKED` (замочек), `AVAILABLE`,
`IN_PROGRESS`, `COMPLETED`.

`POST /api/lessons/{id}/attempt` открывает урок. Вызов идемпотентный: он либо создаёт попытку,
либо возвращает уже существующую целиком — с вопросами, всеми ранее данными ответами и
`currentQuestionIndex`, на котором надо продолжить. Этого одного вызова хватает, чтобы
восстановить экран после того, как студент закрыл Telegram посередине теста. Урок решается один
раз: у завершённой попытки `completedAt != null` и экран открывается в режиме просмотра.

`POST .../answers` сохраняет ответ сразу — это и есть механика сохранения прогресса — и возвращает
вердикт с пояснением, которое показывается после каждого ответа.

Тело ответа одинаково для ДЗ и практики:

```json
{ "questionId": 12, "selectedOptionIds": [3], "answerText": null }
```

Заполняется ровно одно поле по типу вопроса: `selectedOptionIds` для `SINGLE_ANSWER` (один id) и
`MULTI_ANSWER`, `answerText` для `INPUT`. Текстовый ответ сравнивается без учёта регистра.

`POST .../complete` закрывает попытку, считает результат и открывает следующий урок
(`unlockedLessonId`).

---

## Вкладка «Практика»

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/practice/next?subjectId={id}` | `PracticeQuestionDto` |
| `POST` | `/api/practice/answer?subjectId={id}` | `PracticeAnswerResultDto` |
| `GET` | `/api/practice/streak` | `StreakDto` |

Бесконечный поток вопросов одного предмета. Колода собирается один раз на сессию из вопросов уже
открытых студенту уроков плюс отдельных вопросов, добавленных только в практику, и перемешивается.
Курсор живёт внутри сессии: ушёл на другую вкладку и вернулся — тот же вопрос. Кончилась колода —
идёт по кругу в том же порядке. Новая сессия — новая колода с новым порядком.

`GET /next` курсор не двигает, его двигает только ответ, так что перезагрузка страницы возвращает
на тот же вопрос. Финального счёта нет — только вердикт по каждому вопросу и стрик. Стрик
переживает сессии и обнуляется только неверным ответом. В статистику практика не идёт.

---

## Вкладка «Статистика»

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/stats?subjectId={id}` | `StatsDto` |
| `GET` | `/api/stats/prediction?subjectId={id}` | `PredictionDto` |

Прогноз вынесен в отдельный вызов намеренно: он ходит во внешнюю модель и может быть медленным —
счётчики рисуются сразу, балл подгружается следом. Считается по последнему месяцу
(`app.stats.prediction-window`), чтобы недавний прогресс перевешивал ранние ошибки.
`score = null` — данных пока мало.

Учитываются только ответы из ДЗ.

---

## Вкладка «Профиль»

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/profile` | `ProfileDto` |

---

## Админ-панель

Всё под `/api/admin/**`, только для `role = ADMIN`.

### Пользователи и оплата

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/admin/users?search=&page=0&size=20` | `PageResponse<AdminUserItem>` |
| `GET` | `/api/admin/users/{userId}` | `AdminUserDto` |
| `POST` | `/api/admin/users` | 201 `AdminUserDto` |
| `PUT` | `/api/admin/users/{userId}` | `AdminUserDto` |
| `DELETE` | `/api/admin/users/{userId}` | 204 |
| `PUT` | `/api/admin/users/{userId}/subscriptions/{subjectId}` | `SubscriptionItem` |
| `DELETE` | `/api/admin/users/{userId}/subscriptions/{subjectId}` | 204 |

`search` ищет по username, имени и telegram id.

Оплата проходит вне приложения, поэтому даты заводятся руками: `PUT .../subscriptions/{subjectId}`
с телом `{"paidUntil": "2026-12-31T23:59:59"}` — это и «выдать доступ», и «продлить».

Пользователя можно завести до его первого запуска, зная только username: `tgId` тогда пустой и
проставится сам, когда студент откроет мини-апп.

### Предметы

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/admin/subjects` | `SubjectDto[]` |
| `POST` | `/api/admin/subjects` | 201 `SubjectDto` |
| `PUT` | `/api/admin/subjects/{subjectId}` | `SubjectDto` |
| `DELETE` | `/api/admin/subjects/{subjectId}` | 204 |
| `GET` | `/api/admin/subjects/{subjectId}/lessons` | `AdminLessonItem[]` |
| `PUT` | `/api/admin/subjects/{subjectId}/lessons/order` | `AdminLessonItem[]` |
| `GET` | `/api/admin/subjects/{subjectId}/practice-questions` | `AdminQuestionDto[]` |

### Уроки

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/admin/lessons/{lessonId}` | `AdminLessonDto` |
| `POST` | `/api/admin/lessons` | 201 `AdminLessonDto` |
| `PUT` | `/api/admin/lessons/{lessonId}` | `AdminLessonDto` |
| `DELETE` | `/api/admin/lessons/{lessonId}` | 204 |
| `GET` | `/api/admin/lessons/{lessonId}/questions` | `AdminQuestionDto[]` |
| `PUT` | `/api/admin/lessons/{lessonId}/questions/order` | `AdminQuestionDto[]` |

Порядок уроков внутри предмета и вопросов внутри урока задаёт админ. Оба `.../order` принимают
`{"ids": [3, 1, 2]}` — полный список id в нужном порядке.

### Вопросы

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/admin/questions/{questionId}` | `AdminQuestionDto` |
| `POST` | `/api/admin/questions` | 201 `AdminQuestionDto` |
| `PUT` | `/api/admin/questions/{questionId}` | `AdminQuestionDto` |
| `DELETE` | `/api/admin/questions/{questionId}` | 204 |

`PUT` заменяет вопрос вместе со всем набором вариантов: варианты с `id` обновляются, без `id` —
создаются, отсутствующие в списке — удаляются.

Вопрос принадлежит либо уроку (`lessonId`), либо напрямую предмету (`subjectId`) — тогда он
попадает только в практику и не виден в программе уроков. Указывать оба или ни одного нельзя.

`correctAnswer` обязателен для `INPUT`, `options` — для `SINGLE_ANSWER` и `MULTI_ANSWER`.

---

## Модели

Пользовательская сторона никогда не видит правильных ответов до того, как ответит:
`AnswerOptionDto` — это только `{id, text}`, а `correctOptionIds` / `correctAnswer` / `explanation`
приходят в ответе на `POST .../answers`.

```ts
type QuestionType = 'SINGLE_ANSWER' | 'MULTI_ANSWER' | 'INPUT';
type LessonStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
type UserRole = 'USER' | 'ADMIN';

// Даты — ISO local date-time без зоны: "2026-12-31T23:59:59".
type LocalDateTime = string;

interface SessionDto { sessionId: number; startedAt: LocalDateTime; profile: ProfileDto; }

interface ProfileDto {
  id: number; tgId: string; username: string;
  firstName: string; lastName: string;
  role: UserRole; subscriptions: SubscriptionItem[];
}

interface SubscriptionItem {
  subjectId: number; subjectName: string;
  paidUntil: LocalDateTime; active: boolean;   // active === false, если срок вышел
}

interface SubjectItem {
  id: number; name: string;
  paidUntil: LocalDateTime; active: boolean;
  lessonsTotal: number; lessonsCompleted: number;
}

interface LessonItem {
  id: number; title: string; description: string; order: number;
  status: LessonStatus;
  questionCount: number;
  correctAnswers: number | null;    // null, пока урок не начат
}

interface LessonDto {
  id: number; subjectId: number; title: string; description: string;
  order: number; status: LessonStatus; questions: QuestionDto[];
}

interface QuestionDto {
  id: number; title: string; type: QuestionType; order: number;
  options: AnswerOptionDto[];        // пусто для INPUT
}

interface AnswerOptionDto { id: number; text: string; }

interface AttemptDto {
  id: number; lesson: LessonDto;
  startedAt: LocalDateTime; completedAt: LocalDateTime | null;
  currentQuestionIndex: number;      // == questions.length, когда отвечено всё
  answers: AnswerDto[];
}

interface AnswerDto {
  questionId: number;
  selectedOptionIds: number[]; answerText: string | null;
  correct: boolean;
  correctOptionIds: number[]; correctAnswer: string | null; explanation: string;
  answeredAt: LocalDateTime;
}

interface SubmitAnswerRequest {
  questionId: number;
  selectedOptionIds?: number[];
  answerText?: string;
}

interface AnswerResultDto {
  questionId: number; correct: boolean;
  correctOptionIds: number[];        // пусто для INPUT
  correctAnswer: string | null;      // null для вопросов с вариантами
  explanation: string;
  lastQuestion: boolean;
}

interface AttemptResultDto {
  attemptId: number; lessonId: number;
  correctCount: number; totalCount: number; accuracyPercent: number;
  completedAt: LocalDateTime;
  unlockedLessonId: number | null;   // null, если урок был последним
}

interface StreakDto { current: number; best: number; }

interface PracticeQuestionDto {
  subjectId: number; question: QuestionDto; streak: StreakDto;
  position: number; deckSize: number;
}

interface PracticeAnswerResultDto { result: AnswerResultDto; streak: StreakDto; }

interface StatsDto {
  subjectId: number;
  total: PeriodStatsDto;
  lastMonth: PeriodStatsDto;         // окно, по которому считается прогноз
  lessonsCompleted: number; lessonsTotal: number;
  timeSpentMinutes: number;
  streak: StreakDto;
  byLesson: LessonStatsItem[];
}

interface PeriodStatsDto { answered: number; correct: number; accuracyPercent: number; }

interface LessonStatsItem {
  lessonId: number; title: string;
  correct: number; total: number; accuracyPercent: number;
}

interface PredictionDto {
  subjectId: number;
  score: number | null;              // null, пока данных мало
  comment: string;
  computedAt: LocalDateTime;
}

interface ApiError {
  code: string; message: string; timestamp: LocalDateTime;
  fields?: Record<string, string>;
}

interface PageResponse<T> {
  content: T[]; page: number; size: number;
  totalElements: number; totalPages: number;
}
```

### Админские модели

```ts
interface AdminUserItem {
  id: number; tgId: string; username: string;
  firstName: string; lastName: string;
  role: UserRole; subscriptions: SubscriptionItem[];
}

interface AdminUserDto extends AdminUserItem { progress: UserProgressItem[]; }

interface UserProgressItem {
  subjectId: number; subjectName: string;
  currentLessonId: number; currentLessonTitle: string;
  lessonsCompleted: number; lessonsTotal: number;
}

interface UserRequest {
  username: string;                  // обязателен
  tgId?: string; firstName?: string; lastName?: string; role?: UserRole;
}

interface SubscriptionRequest { paidUntil: LocalDateTime; }

interface SubjectDto {
  id: number; name: string;
  lessonsCount: number; practiceOnlyQuestionsCount: number;
}
interface SubjectRequest { name: string; }

interface AdminLessonItem {
  id: number; subjectId: number; title: string; description: string;
  order: number; questionCount: number;
}

interface AdminLessonDto {
  id: number; subjectId: number; title: string; description: string;
  order: number; questions: AdminQuestionDto[];
}

interface LessonRequest {
  subjectId: number; title: string;
  description?: string;
  order?: number;                    // без него — в конец списка
}

interface AdminQuestionDto {
  id: number;
  lessonId: number | null;           // ровно одно из lessonId / subjectId
  subjectId: number | null;
  title: string; type: QuestionType; order: number;
  correctAnswer: string | null; explanation: string;
  options: AdminAnswerOptionDto[];
}

interface AdminAnswerOptionDto { id: number; text: string; correct: boolean; }

interface QuestionRequest {
  lessonId?: number; subjectId?: number;
  title: string; type: QuestionType; order?: number;
  correctAnswer?: string; explanation?: string;
  options?: AnswerOptionRequest[];
}

interface AnswerOptionRequest {
  id?: number;                       // без id — новый вариант
  text: string; correct: boolean;
}

interface ReorderRequest { ids: number[]; }
```
