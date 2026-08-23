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

Роль возвращается в `GET /api/profile` → `role` (`USER` | `ADMIN` | `TEACHER`). Фронтенд по ней
решает, рисовать ли четыре студенческие вкладки или админ-панель. Ветка `/api/admin/**`
дополнительно проверяется на сервере и отдаёт 403 всем, кроме `ADMIN` и `TEACHER`.

`TEACHER` — учитель: ведёт содержание выданных ему предметов и смотрит статистику своих учеников.
Внутри `/api/admin/**` его права уже́ этих: см. матрицу в разделе «Админ-панель».

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
| `LESSON_LOCKED` | 403 | урок ещё не открылся по расписанию |
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
`IN_PROGRESS`, `COMPLETED`. Возвращаются все уроки предмета, закрытые в том числе.

Доступ к уроку задаёт админ датой `opensAt`: до неё урок под замком, после — открыт сразу всем,
кто оплатил предмет. Уроки не открываются друг за другом, поэтому открытых одновременно может
быть сколько угодно и проходить их можно в любом порядке. Пустой `opensAt` означает, что урок ещё
не поставили в расписание, и он тоже под замком — плашка при этом видна, но без даты. Уже начатый
урок остаётся доступным, даже если админ потом сдвинул дату вперёд.

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

`POST .../complete` закрывает попытку и считает результат.

---

## Вкладка «Практика»

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/practice/next?subjectId={id}` | `PracticeQuestionDto` |
| `POST` | `/api/practice/answer?subjectId={id}` | `PracticeAnswerResultDto` |
| `GET` | `/api/practice/streak` | `StreakDto` |

Бесконечный поток вопросов одного предмета. Колода собирается один раз на сессию из вопросов всех
уроков предмета плюс отдельных вопросов, добавленных только в практику, и перемешивается.
Расписание уроков практику не ограничивает: вопрос из ещё не открытого урока здесь встретиться
может.
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

`GET /api/stats/prediction` никогда не блокируется на модели и отвечает мгновенно: если свежего
значения ещё нет, оно досчитывается в фоне, а вызов сразу возвращает то, что есть — старое
значение или заглушку с `pending: true`. Подробности контракта и как с ним работать на фронте —
[AI_SCORE_PREDICTION.md](AI_SCORE_PREDICTION.md).

Учитываются только ответы из ДЗ.

---

## Вкладка «Профиль»

| метод | путь | ответ |
|---|---|---|
| `GET` | `/api/profile` | `ProfileDto` |

---

## Админ-панель

Всё под `/api/admin/**`, для `role = ADMIN` и `role = TEACHER`. Роль ученика получает 403 на всю
ветку целиком.

### Матрица прав

| эндпоинт | ADMIN | TEACHER |
|---|---|---|
| `GET /api/admin/users` | все | только ученики (`role = USER`) с подпиской на его предметы |
| `GET /api/admin/users/{id}` | полная карточка | урезанная; чужой ученик → 404 |
| `POST/PUT/DELETE /api/admin/users/**` | ✓ | 403 |
| `PUT/DELETE /api/admin/users/{id}/subscriptions/**` | ✓ | 403 |
| `PUT/DELETE /api/admin/users/{id}/subjects/{subjectId}` | ✓ | 403 |
| `GET /api/admin/subjects` | все | только его предметы |
| `POST/PUT/DELETE /api/admin/subjects` | ✓ | 403 |
| `GET/PUT /api/admin/subjects/{id}/lessons`, `.../lessons/order` | ✓ | если предмет его |
| `GET /api/admin/subjects/{id}/practice-questions` | ✓ | если предмет его |
| `GET/POST/PUT/DELETE /api/admin/lessons/**` | ✓ | если урок в его предмете |
| `GET/POST/PUT/DELETE /api/admin/questions/**` | ✓ | если вопрос в его предмете |

Чужой ресурс отдаёт **404 `NOT_FOUND`**, а не 403: перебором id учитель не должен узнать, какие
предметы, уроки и вопросы вообще есть в приложении. 403 `FORBIDDEN` остаётся за операциями,
закрытыми для роли в принципе — правка пользователей, создание, переименование и удаление предмета.

Тело `PUT` тоже проверяется, а не только путь: перенести свой урок в чужой предмет
(`LessonRequest.subjectId`) или свой вопрос в чужой урок (`QuestionRequest.lessonId`) нельзя.

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
| `PUT` | `/api/admin/users/{userId}/subjects/{subjectId}` | `TaughtSubjectItem` |
| `DELETE` | `/api/admin/users/{userId}/subjects/{subjectId}` | 204 |

`search` ищет по username, имени и telegram id.

`PUT/DELETE .../subjects/{subjectId}` выдаёт и забирает предмет **учителю** — это его право
редактировать содержание, а не подписка. Пользователь без роли `TEACHER` → 409 `CONFLICT`,
повторная выдача того же предмета проходит молча. Смена роли учителя на любую другую очищает его
предметы, удаление учителя — тоже.

Учитель видит `GET /api/admin/users` только со своими учениками: `role = USER` и подписка на один
из его предметов, **без учёта `paidUntil`** — ученик с истёкшим доступом должен остаться на виду.
В его карточке (`GET /api/admin/users/{userId}`) `subscriptions` и `taughtSubjects` пустые,
`progress` — только его предметы, `activity` посчитана по ним же. Ученик не его предмета — 404.

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
`{"ids": [3, 1, 2]}` — полный список id в нужном порядке. К доступу порядок уроков отношения не
имеет, его задаёт только `opensAt`.

`opensAt` в `LessonRequest` пишется как передан: отсутствующее или `null` поле стирает дату и
возвращает урок под замок. Дата в прошлом — обычный способ открыть урок прямо сейчас.

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
// Зоны нет нигде: и сервер, и админка работают во времени школы (Europe/Minsk,
// задано через TZ в контейнере). Даты открытия уроков вводятся и сравниваются
// именно в нём, поэтому переводить их в UTC на фронте нельзя.
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
  opensAt: LocalDateTime | null;    // null — урок не в расписании, под замком
  status: LessonStatus;
  questionCount: number;
  correctAnswers: number | null;    // null, пока урок не начат
}

interface LessonDto {
  id: number; subjectId: number; title: string; description: string;
  order: number; opensAt: LocalDateTime | null;
  status: LessonStatus; questions: QuestionDto[];
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
  score: number | null;              // null, пока данных мало или ещё нет ни одной оценки
  comment: string;
  computedAt: LocalDateTime | null;  // null, пока ни разу не считалось
  pending: boolean;                  // true — считается в фоне, стоит опросить эндпоинт ещё раз
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
  taughtSubjects: TaughtSubjectItem[];  // непусто только у role = TEACHER
}

interface AdminUserDto extends AdminUserItem {
  progress: UserProgressItem[];
  activity: UserActivityItem;
}

// Предмет, который ведёт учитель. Это не подписка: ни оплаты, ни срока здесь нет.
interface TaughtSubjectItem { subjectId: number; subjectName: string; }

interface UserActivityItem {
  answered: number; correct: number;   // домашка, практика не в счёт
  accuracyPercent: number;
  timeSpentMinutes: number;            // по всем сессиям
  streak: StreakDto;
}

// Админу answered/correct/accuracyPercent считаются по всем предметам, учителю — по его.
// timeSpentMinutes и streak у учителя остаются общими по приложению: ни сессии, ни стрик
// практики в схеме к предмету не привязаны, разбить их по предметам нечем.

interface UserProgressItem {
  subjectId: number; subjectName: string;
  // последний сданный урок, null — предмет ещё не открывали
  lastCompletedLessonId: number | null; lastCompletedLessonTitle: string | null;
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
  order: number; opensAt: LocalDateTime | null; questionCount: number;
}

interface AdminLessonDto {
  id: number; subjectId: number; title: string; description: string;
  order: number; opensAt: LocalDateTime | null; questions: AdminQuestionDto[];
}

interface LessonRequest {
  subjectId: number; title: string;
  description?: string;
  order?: number;                    // без него — в конец списка
  opensAt?: LocalDateTime;           // без него — урок под замком
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
