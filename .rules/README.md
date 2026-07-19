# PROJECT CONTEXT: Multi-Client WhatsApp AI Platform

## Objective

Build a scalable, production-ready WhatsApp AI automation platform that supports multiple businesses (clients). The system must handle conversations, generate AI responses, and provide a dashboard for managing chats.

This is NOT a single-client bot. This is a multi-tenant system designed for scalability.

---

## Core Concept

The system acts as a central platform where:

* Multiple businesses connect their WhatsApp numbers
* Each business has its own conversations and leads
* The backend processes all messages
* AI generates responses when enabled
* Humans can take over conversations when needed

---

## High-Level Architecture

1. User sends WhatsApp message
2. Meta WhatsApp API sends webhook
3. Backend receives webhook
4. System identifies client using phone_number_id
5. System finds or creates conversation
6. Message is stored in database
7. System checks conversation mode
8. If agent mode → AI generates response
9. Response sent via WhatsApp API
10. Response stored in database
11. Frontend dashboard reflects updates

---

## Multi-Tenant Requirement (CRITICAL)

The system must support multiple clients using ONE backend.

Each client must have:

* Unique WhatsApp phone_number_id
* Separate conversations
* Separate message history

The system must:

* Identify client using phone_number_id
* Never mix data between clients

---

## Database Design

### clients

Stores business information

* id
* business_name
* whatsapp_phone_number_id (unique)
* access_token
* created_at

### conversations

Stores chat sessions per client

* id
* client_id
* phone
* name
* mode (agent or human)
* created_at
* updated_at

Important:

* Same phone number can exist across different clients

### messages

Stores all chat messages

* id
* conversation_id
* role (user or assistant)
* content
* whatsapp_msg_id (unique)
* created_at

---

## Context Handling (AI Memory)

Context is derived from message history.

For every new message:

1. Fetch last 10 messages from messages table
2. Order by created_at ascending
3. Format into chat structure
4. Send to AI model

Do NOT store separate context.
Use messages table as source of truth.

---

## Backend Responsibilities

The backend is the core system and must:

1. Handle WhatsApp webhook
2. Identify client using phone_number_id
3. Manage conversations
4. Store messages
5. Prevent duplicate messages
6. Fetch conversation context
7. Call AI API
8. Send responses via WhatsApp API
9. Respect conversation mode (agent or human)

---

## AI Behavior Rules

The AI must:

* Respond in short WhatsApp-style messages
* Be conversational and clear
* Ask one question at a time
* Focus on lead conversion
* Avoid long paragraphs
* Avoid hallucination

---

## Mode System

Each conversation has a mode:

1. agent:

* AI automatically replies

2. human:

* AI does NOT reply
* Human replies via dashboard

System must always check mode before generating AI response.

---

## API Responsibilities

The backend must expose APIs for:

* Webhook handling
* Fetching conversations
* Fetching messages
* Updating conversation mode
* Sending manual messages
* Creating new clients

---

## Frontend Requirements

Minimal dashboard with:

1. Conversation list (sidebar)
2. Chat interface (main panel)
3. Mode toggle (agent/human)
4. Message input (manual reply)

UI must be simple and functional.
No complex design required.

---

## WhatsApp Integration

System uses Meta WhatsApp Cloud API.

Requirements:

* Verify webhook
* Handle incoming messages
* Send outgoing messages
* Use client-specific credentials (no global token)

---

## Performance Requirements

* Webhook must respond within 5 seconds
* Avoid blocking operations
* Prevent duplicate processing

---

## Scalability Rules

* Single backend for all clients
* No separate deployments per client
* Use database to separate client data

---

## Coding Principles

* Modular code structure
* No hardcoded values
* Use environment variables
* Clear separation of concerns

---

## Expected Output

Generate:

1. Backend code (Next.js API routes)
2. Database queries and integration
3. AI integration logic
4. WhatsApp API integration
5. Frontend dashboard
6. API routes for frontend
7. Setup and deployment instructions

---

## Constraints

* Do not overcomplicate architecture
* Keep logic clean and maintainable
* Focus on reliability over complexity
* Prioritize working system over perfect system

---

## Final Note

This project is a scalable platform, not a prototype.

All decisions must support:

* Multi-client handling
* Clean architecture
* Future scalability

---

## END OF CONTEXT
