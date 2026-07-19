# Comments.md

## Purpose

This file defines **strict commenting standards** for the entire codebase.

All developers and AI agents MUST follow these rules to ensure:
- Readability
- Maintainability
- Consistency across the project

---

## 1. Function / Class Level Comments (MANDATORY)

Every function or class MUST have a structured comment placed **immediately above it**.

### Format:
/*{
    Function Name: <Function Name>
    Purpose: <Clear explanation of what the function/class does>
    Parameters: <List and description of parameters (if applicable)>
}*/

---

### Example (Function)
/*{
    Function Name: createConversation
    Purpose: Creates a new conversation for a client if it does not exist
    Parameters: clientId (string), phone (string), name (string)
}*/
async function createConversation(clientId, phone, name) {
    // Function body
}

### Example (Class)
/*{
    Class Name: WhatsAppService
    Purpose: Handles all interactions with WhatsApp Cloud API
}*/
class WhatsAppService {
    // Class body
}   

---

## 2. Inline Comments (MANDATORY)

All code should be self-documenting, but when adding complex logic, use inline comments to explain:
- The reason behind a specific implementation
- Complex calculations or algorithms

---

### Format:
// <Brief explanation>

---

### Example:
// Check if conversation already exists to prevent duplicates
if (await prisma.conversation.findUnique({ where: { phone } })) {
    return; // Skip if exists
}

## 3. When to Add Comments

You MUST add comments in:
- API routes
- Business logic
- Database queries
- Conditional logic
- External API calls
- Any non-trivial operation

### Example:
// Create conversation if it doesn't exist
if (await prisma.conversation.findUnique({ where: { phone } })) {
    return; // Skip if exists
}

## 4. When NOT to Add Comments

### Example (❌ Bad):
// Define phone number
const phone = "1234567890";


## 5. Naming + Clarity Rule
- Write comments in simple English
- Avoid jargon unless necessary
- Make comments understandable for new developers


## 6. Consistency Rule (CRITICAL)
- Follow the SAME format across the entire project
- Do NOT mix styles
- Do NOT skip function comments

## 7. Priority Rule
If there is any conflict:
**Follow this file (Comments.md) over personal preference**