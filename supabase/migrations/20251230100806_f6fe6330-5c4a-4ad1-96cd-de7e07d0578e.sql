-- First, clean up duplicate subjects by keeping only the one with the most attendance records
-- For each user and subject name, keep the subject_id with the most attendance records

-- Create temp table to identify duplicates and which ones to keep
WITH ranked_subjects AS (
  SELECT 
    s.id,
    s.user_id,
    s.name,
    COALESCE(ar.record_count, 0) as record_count,
    ROW_NUMBER() OVER (PARTITION BY s.user_id, s.name ORDER BY COALESCE(ar.record_count, 0) DESC, s.created_at ASC) as rn
  FROM subjects s
  LEFT JOIN (
    SELECT subject_id, COUNT(*) as record_count 
    FROM attendance_records 
    GROUP BY subject_id
  ) ar ON ar.subject_id = s.id
),
subjects_to_delete AS (
  SELECT id FROM ranked_subjects WHERE rn > 1
),
subjects_to_keep AS (
  SELECT id, user_id, name FROM ranked_subjects WHERE rn = 1
)
-- Update attendance_records to point to the kept subject before deleting duplicates
UPDATE attendance_records ar
SET subject_id = (
  SELECT sk.id FROM subjects_to_keep sk 
  JOIN subjects s ON s.id = ar.subject_id 
  WHERE sk.user_id = s.user_id AND sk.name = s.name
)
WHERE ar.subject_id IN (SELECT id FROM subjects_to_delete);

-- Now delete the duplicate subjects
DELETE FROM subjects 
WHERE id IN (
  WITH ranked_subjects AS (
    SELECT 
      s.id,
      s.user_id,
      s.name,
      ROW_NUMBER() OVER (PARTITION BY s.user_id, s.name ORDER BY s.created_at ASC) as rn
    FROM subjects s
  )
  SELECT id FROM ranked_subjects WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE subjects ADD CONSTRAINT subjects_user_id_name_unique UNIQUE (user_id, name);