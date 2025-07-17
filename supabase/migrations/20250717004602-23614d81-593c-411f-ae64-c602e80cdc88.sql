-- Add allow_contact field to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS allow_contact boolean NOT NULL DEFAULT true;

-- Create conversations table
CREATE TABLE public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(project_id, sender_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages  
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view conversations they are part of" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = creator_id OR auth.uid() = sender_id);

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = creator_id OR auth.uid() = sender_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.creator_id = auth.uid() OR conversations.sender_id = auth.uid())
    )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.creator_id = auth.uid() OR conversations.sender_id = auth.uid())
    )
);

CREATE POLICY "Users can update messages in their conversations" 
ON public.messages 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.creator_id = auth.uid() OR conversations.sender_id = auth.uid())
    )
);

-- Create updated_at triggers
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;