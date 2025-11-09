-- Backfill "Why it matters" sections so progress tracking works with the flip-card interaction
INSERT INTO lesson_sections (lesson_id, order_index, slug, title, body_md)
SELECT l.id,
       -1,
       'why-it-matters',
       'Why it matters',
       '# Why it matters

Programming builds computational thinking, opens career opportunities, and lets you automate real-world tasks.'
FROM lessons l
WHERE NOT EXISTS (
  SELECT 1
  FROM lesson_sections ls
  WHERE ls.lesson_id = l.id
    AND ls.slug = 'why-it-matters'
);
