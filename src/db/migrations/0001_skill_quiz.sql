-- Add skill_quiz to onboarding_step enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'onboarding_step' AND e.enumlabel = 'skill_quiz'
  ) THEN
    ALTER TYPE onboarding_step ADD VALUE 'skill_quiz';
  END IF;
END $$;

-- Create skill_level enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level') THEN
    CREATE TYPE skill_level AS ENUM ('beginner','intermediate','advanced');
  END IF;
END $$;

-- Add skill_level column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_level skill_level;

-- Create skill_questions table
CREATE TABLE IF NOT EXISTS skill_questions (
  id serial PRIMARY KEY,
  order_index integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  difficulty difficulty
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_skill_questions__order'
  ) THEN
    CREATE UNIQUE INDEX uq_skill_questions__order ON skill_questions(order_index);
  END IF;
END $$;

-- Create skill_options table
CREATE TABLE IF NOT EXISTS skill_options (
  id serial PRIMARY KEY,
  question_id integer NOT NULL REFERENCES skill_questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'ix_skill_options__question'
  ) THEN
    CREATE INDEX ix_skill_options__question ON skill_options(question_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_skill_options__question_order'
  ) THEN
    CREATE UNIQUE INDEX uq_skill_options__question_order ON skill_options(question_id, order_index);
  END IF;
END $$;

-- Ensure exactly one correct option per question (partial unique index)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_skill_options__one_correct_per_question'
  ) THEN
    CREATE UNIQUE INDEX uq_skill_options__one_correct_per_question ON skill_options(question_id) WHERE is_correct = true;
  END IF;
END $$;

-- Seed minimal question set if table empty
DO $$
DECLARE cnt integer;
BEGIN
  SELECT COUNT(*) INTO cnt FROM skill_questions;
  IF cnt = 0 THEN
    INSERT INTO skill_questions(order_index, text, difficulty) VALUES
      (1, 'What is the output of: print(len({"a": 1, "b": 2})) in Python?', 'easy'),
      (2, 'Which data structure provides O(1) average-time lookup by key?', 'standard'),
      (3, 'What does Big-O notation describe?', 'standard'),
      (4, 'Which algorithm has O(n log n) average-case time?', 'standard'),
      (5, 'What is a stable sorting algorithm?', 'hard');

    -- Q1 options
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 1, '2', true FROM skill_questions WHERE order_index = 1;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 2, '1', false FROM skill_questions WHERE order_index = 1;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 3, '0', false FROM skill_questions WHERE order_index = 1;

    -- Q2 options
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 1, 'Hash map / dict', true FROM skill_questions WHERE order_index = 2;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 2, 'Array list', false FROM skill_questions WHERE order_index = 2;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 3, 'Linked list', false FROM skill_questions WHERE order_index = 2;

    -- Q3 options
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 1, 'Upper bound on algorithm growth', true FROM skill_questions WHERE order_index = 3;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 2, 'Exact runtime in seconds', false FROM skill_questions WHERE order_index = 3;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 3, 'Memory address', false FROM skill_questions WHERE order_index = 3;

    -- Q4 options
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 1, 'Merge sort', true FROM skill_questions WHERE order_index = 4;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 2, 'Bubble sort', false FROM skill_questions WHERE order_index = 4;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 3, 'Selection sort', false FROM skill_questions WHERE order_index = 4;

    -- Q5 options
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 1, 'One that preserves relative order of equal elements', true FROM skill_questions WHERE order_index = 5;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 2, 'One that is fastest in all cases', false FROM skill_questions WHERE order_index = 5;
    INSERT INTO skill_options(question_id, order_index, text, is_correct)
    SELECT id, 3, 'One that uses the least memory always', false FROM skill_questions WHERE order_index = 5;
  END IF;
END $$;


