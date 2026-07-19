-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients Table (Tenants)
-- Stores metadata about each business client using the system
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    whatsapp_phone_number_id TEXT UNIQUE NOT NULL, -- WhatsApp's internal ID for the phone number
    access_token TEXT NOT NULL,                   -- WhatsApp API access token for this client
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Conversations Table
-- Stores metadata about each unique chat, scoped to a client
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    phone TEXT NOT NULL, -- User's phone number
    name TEXT,          -- User's display name
    mode TEXT CHECK (mode IN ('agent', 'human')) DEFAULT 'agent',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure a phone number is unique WITHIN a single client's scope
    -- but can exist across different clients.
    UNIQUE(client_id, phone)
);

-- 3. Messages Table
-- Stores individual messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    whatsapp_msg_id TEXT UNIQUE, -- Unique ID from WhatsApp to prevent duplicates
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clients_phone_id ON clients(whatsapp_phone_number_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_phone ON conversations(client_id, phone);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_whatsapp_msg_id ON messages(whatsapp_msg_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Automatically updates the 'updated_at' timestamp on the conversations table
/*{
    Function Name: update_updated_at_column
    Purpose: Automatically updates the 'updated_at' timestamp on the conversations table
    Parameters: None (Trigger function)
}*/
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
