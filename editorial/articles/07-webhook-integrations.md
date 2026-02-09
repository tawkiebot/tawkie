---
title: "Talkie + n8n/Zapier/Webhooks: Integration Patterns"
description: "Three integration patterns for voice automation: fire-and-forget, two-way sync, and approval chains."
keywords: ["webhook integration", "n8n voice", "zapier automation", "voice integrations"]
OGImage: "/images/webhook-integrations-og.jpg"
---

# Talkie + n8n/Zapier/Webhooks: Integration Patterns

Voice → structured output → external systems. Three patterns for production use.

---

## Pattern 1: Fire-and-Forget

Voice triggers an action. No response required.

**Use cases:**
- Create note in Notion
- Add row to spreadsheet
- Log time entry
- Send message to personal channel

**Flow:**
```
Voice → Parse → Webhook POST → System X
```

**Example (Notion database):**
```json
{
  "trigger": "log time",
  "action": {
    "url": "https://api.notion.com/v1/pages",
    "method": "POST",
    "body": {
      "parent": {"database_id": "DATABASE_ID"},
      "properties": {
        "Task": {"title": [{"text": {"content": "Code review"}}},
        "Date": {"date": {"start": "2026-02-09"}},
        "Hours": {"number": 1}
      }
    }
  }
}
```

---

## Pattern 2: Two-Way Sync

Voice triggers action. External system responds. Response delivered to user.

**Use cases:**
- Create ticket, get ticket ID
- Query database, return results
- Check status, report result

**Flow:**
```
Voice → Parse → Webhook POST → Wait Response → Speak Result
```

**Example (Linear ticket creation):**
```json
{
  "trigger": "create ticket",
  "action": {
    "url": "https://api.linear.app/graphql",
    "method": "POST",
    "headers": {"Authorization": "Bearer TOKEN"},
    "body": {
      "query": "mutation { issueCreate(...) { success issue { id } } }"
    }
  },
  "response_handler": {
    "extract": "data.issueCreate.issue.id",
    "speak": "Ticket created, ID ${id}"
  }
}
```

---

## Pattern 3: Approval Chains

Voice triggers request. Human approves. Action executes.

**Use cases:**
- Send message to team channel
- Post to social media
- Modify shared documents
- Expense submissions

**Flow:**
```
Voice → Parse → Pending Approval → Human Approves → Execute
```

**Example (Slack message to team):**
```json
{
  "trigger": "message team",
  "action": {
    "url": "https://slack.com/api/chat.postMessage",
    "method": "POST",
    "body": {
      "channel": "#team-updates",
      "text": "${message}"
    }
  },
  "approval_required": true,
  "approval_channel": "personal-dm"
}
```

---

## Payload Design

**Schema versioning:**
```json
{
  "version": "1.0",
  "timestamp": "2026-02-09T10:00:00Z",
  "source": "voice",
  "payload": { ... }
}
```

**Idempotency keys:**
```json
{
  "idempotency_key": "voice-2026-02-09-${unique_action_hash}"
}
```

Prevents duplicate execution if webhook retries.

---

## Error Handling

| Error Type | Handling |
|------------|----------|
| Network timeout | Retry 3x with exponential backoff |
| 4xx response | Log error, notify user, don't retry |
| 5xx response | Retry 3x, then queue for manual |
| Parse error | Queue for human review |

---

## Three Production Recipes

**Recipe 1: Voice → Notion Daily Log**
- Trigger: "log my day"
- Action: POST to Notion database entry
- Response: Confirmation with entry link

**Recipe 2: Voice → Linear Ticket**
- Trigger: "create bug ticket"
- Action: GraphQL mutation to create issue
- Response: Ticket ID and link

**Recipe 3: Voice → Approval → Slack**
- Trigger: "announce to team"
- Action: Queue for approval
- Response: On approve, post to #announcements

---

**CTA:** [Open integration docs and example payloads](/docs/integrations)

**Related:**
- [Voice-Triggered Workflows on Mac](/docs/voice-triggered-workflows-mac)
- [From Transcript to Task: Reliable Automation Pipeline](/engineering/transcript-to-task-automation)
