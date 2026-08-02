CREATE TYPE "user_role" AS ENUM (
  'user',
  'admin'
);

CREATE TYPE "question_type" AS ENUM (
  'single_answer',
  'multi_answer',
  'input'
);

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "tg_id" varchar,
  "username" varchar,
  "role" user_role DEFAULT 'user'
);

CREATE TABLE "user_sessions" (
  "id" bigserial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "started_at" timestamp,
  "ended_at" timestamp
);

CREATE TABLE "subjects" (
  "id" serial PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "subscriptions" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "subject_id" integer NOT NULL,
  "paid_until" timestamp NOT NULL
);

CREATE TABLE "lessons" (
  "id" serial PRIMARY KEY,
  "title" varchar,
  "description" varchar,
  "order" integer,
  "subject_id" integer NOT NULL
);

CREATE TABLE "user_practice_stats" (
  "user_id" integer PRIMARY KEY,
  "current_streak" integer DEFAULT 0,
  "best_streak" integer DEFAULT 0
);

CREATE TABLE "questions" (
  "id" serial PRIMARY KEY,
  "title" varchar,
  "type" question_type NOT NULL,
  "order" integer,
  "lesson_id" integer,
  "correct_answer" varchar,
  "explanation" varchar
);

CREATE TABLE "answer_options" (
  "id" serial PRIMARY KEY,
  "question_id" integer NOT NULL,
  "text" varchar NOT NULL,
  "is_correct" boolean DEFAULT false
);

CREATE TABLE "user_subject_progress" (
  "user_id" integer,
  "subject_id" integer,
  "current_lesson" integer NOT NULL,
  PRIMARY KEY ("user_id", "subject_id")
);

CREATE TABLE "user_attempts" (
  "id" bigserial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "lesson_id" integer NOT NULL,
  "started_at" timestamp,
  "completed_at" timestamp
);

CREATE TABLE "user_answers" (
  "id" bigserial PRIMARY KEY,
  "attempt_id" bigint NOT NULL,
  "question_id" integer NOT NULL,
  "answer_text" varchar,
  "is_correct" boolean,
  "answered_at" timestamp
);

CREATE TABLE "user_answer_options" (
  "user_answer_id" bigint NOT NULL,
  "answer_option_id" integer NOT NULL,
  PRIMARY KEY ("user_answer_id", "answer_option_id")
);

CREATE UNIQUE INDEX ON "lessons" ("order", "subject_id");

CREATE UNIQUE INDEX ON "questions" ("order", "lesson_id");

CREATE UNIQUE INDEX ON "user_answers" ("attempt_id", "question_id");

ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_practice_stats" ADD CONSTRAINT "user_practice_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_current_lesson_fkey" FOREIGN KEY ("current_lesson") REFERENCES "lessons" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "user_attempts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_answer_options" ADD CONSTRAINT "user_answer_options_user_answer_id_fkey" FOREIGN KEY ("user_answer_id") REFERENCES "user_answers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_answer_options" ADD CONSTRAINT "user_answer_options_answer_option_id_fkey" FOREIGN KEY ("answer_option_id") REFERENCES "answer_options" ("id") DEFERRABLE INITIALLY IMMEDIATE;
