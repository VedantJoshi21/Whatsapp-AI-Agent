# Instructions.md

## Project Overview

This project is a **Multi-Client WhatsApp AI Automation Platform** designed to handle conversations, generate AI responses, and provide a dashboard for multiple businesses using a single backend.

This is a **multi-tenant system**, not a single-client bot.

---

## Core System Flow

1. User sends WhatsApp message
2. Meta WhatsApp API triggers webhook
3. Backend receives webhook
4. Identify client using `phone_number_id`
5. Find or create conversation
6. Store incoming message in database
7. Check conversation mode
8. If mode = agent → generate AI response
9. Send response via WhatsApp API
10. Store response in database
11. Reflect updates in frontend dashboard

---

## Multi-Tenant Rules (CRITICAL)

- Each client has:
  - Unique `whatsapp_phone_number_id`
  - Separate conversations
  - Separate message history

- System must:
  - Identify client using `phone_number_id`
  - NEVER mix data between clients
  - Always scope queries using `client_id`

---

## Database Rules

### Clients Table
- Stores business information
- Must include:
  - id
  - business_name
  - whatsapp_phone_number_id (unique)
  - access_token
  - created_at

---

### Conversations Table
- Stores chat sessions per client
- Must include:
  - id
  - client_id
  - phone
  - name
  - mode (agent | human)
  - created_at
  - updated_at

- Important:
  - Same phone number CAN exist across different clients

---

### Messages Table
- Stores all chat messages
- Must include:
  - id
  - conversation_id
  - role (user | assistant)
  - content
  - whatsapp_msg_id (unique)
  - created_at

- Must prevent duplicate message insertion using `whatsapp_msg_id`

---

## Context Handling (AI Memory)

- DO NOT store separate context
- Use `messages` table as the source of truth

For every new message:
1. Fetch last 10 messages
2. Order by `created_at ASC`
3. Format into chat structure
4. Send to AI model

---

## Backend Responsibilities

The backend MUST:

1. Handle WhatsApp webhook
2. Identify client using `phone_number_id`
3. Manage conversations
4. Store messages
5. Prevent duplicate messages
6. Fetch conversation context
7. Call AI API
8. Send responses via WhatsApp API
9. Respect conversation mode

---

## AI Behavior Rules

The AI must:

- Respond in short WhatsApp-style messages
- Be conversational and clear
- Ask ONE question at a time
- Focus on lead conversion
- Avoid long paragraphs
- Avoid hallucination

---

## Mode System

Each conversation has a mode:

### agent
- AI automatically replies

### human
- AI must NOT reply
- Human replies via dashboard

System must ALWAYS check mode before generating response

---

## API Responsibilities

Backend must expose APIs for:

- Webhook handling
- Fetch conversations
- Fetch messages
- Update conversation mode
- Send manual messages
- Create new clients

---

## Frontend Requirements

Dashboard must include:

1. Conversation list (sidebar)
2. Chat interface (main panel)
3. Mode toggle (agent/human)
4. Message input (manual reply)

- Keep UI simple and functional
- No unnecessary complexity

---

## WhatsApp Integration Rules

- Use Meta WhatsApp Cloud API
- Verify webhook properly
- Handle incoming messages
- Send outgoing messages
- Use CLIENT-SPECIFIC credentials (no global token)

---

## Performance Rules

- Webhook must respond within 5 seconds
- Avoid blocking operations
- Use async processing where needed
- Prevent duplicate message processing

---

## Scalability Rules

- Single backend for ALL clients
- No separate deployments per client
- Use database-level separation
- Design for future scale

---

## Coding Principles

- Modular code structure
- No hardcoded values
- Use environment variables
- Clear separation of concerns
- Write clean and readable code

---

## Logging Rules (CRITICAL)

- **Mandatory Logging**: All webhook payloads, API requests, and system responses MUST be logged.
- **File-Based Logs**: Logs must be stored in the `logs/` directory using the `logger` utility.
- **Log Structure**: 
  - Log raw WhatsApp payloads for debugging.
  - Log AI generation steps and final responses.
  - Log all database operation errors.
  - Log all external API failures (Meta, OpenRouter).
- **Criticality**: Logging is essential for auditing multi-tenant data and troubleshooting webhook failures.

---

## Commenting Rules (MANDATORY)

The agent MUST follow the `COMMENTS.md` file for all code comments.