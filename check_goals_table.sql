-- Önce mevcut goals tablosunu kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'goals'
ORDER BY ordinal_position;

