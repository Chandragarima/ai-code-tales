-- Make username nullable since users might not have a username initially
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;