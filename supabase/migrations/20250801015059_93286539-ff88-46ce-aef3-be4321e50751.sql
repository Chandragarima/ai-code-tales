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
          WHEN creator_id < sender_id THEN creator_id || '_' || sender_id
          ELSE sender_id || '_' || creator_id
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

-- Add a unique constraint to prevent future duplicates
-- This ensures only one conversation can exist between any two users for a given project
ALTER TABLE conversations 
ADD CONSTRAINT unique_project_user_conversation 
UNIQUE (project_id, LEAST(creator_id, sender_id), GREATEST(creator_id, sender_id));