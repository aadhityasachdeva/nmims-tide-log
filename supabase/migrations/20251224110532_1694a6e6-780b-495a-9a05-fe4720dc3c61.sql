-- Add time_slot column to track individual lectures
ALTER TABLE public.attendance_records 
ADD COLUMN time_slot text;

-- Drop the old unique constraint if it exists
ALTER TABLE public.attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_subject_id_date_key;

-- Create new unique constraint including time_slot
ALTER TABLE public.attendance_records 
ADD CONSTRAINT attendance_records_subject_date_slot_key 
UNIQUE (subject_id, date, time_slot);