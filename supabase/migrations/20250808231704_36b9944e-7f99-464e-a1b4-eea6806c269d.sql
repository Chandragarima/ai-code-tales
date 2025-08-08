-- One-time cleanup: remove any conversations with zero messages
DELETE FROM public.conversations c
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages m WHERE m.conversation_id = c.id
);
