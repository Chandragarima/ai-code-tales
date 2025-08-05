-- Clean up duplicate conversations by removing older duplicates
-- Keep only the most recent conversation for each unique project_id + user pair combination
WITH conversation_rankings AS (
  SELECT 
    id,
    project_id,
    creator_id,
    sender_id,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        project_id,
        CASE 
          WHEN creator_id < sender_id THEN creator_id::text || '_' || sender_id::text
          ELSE sender_id::text || '_' || creator_id::text
        END
      ORDER BY updated_at DESC
    ) as rn
  FROM conversations
),
duplicates_to_delete AS (
  SELECT id 
  FROM conversation_rankings 
  WHERE rn > 1
)
DELETE FROM conversations 
WHERE id IN (SELECT id FROM duplicates_to_delete);