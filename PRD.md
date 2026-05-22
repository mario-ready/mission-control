# Mission Control — PRD

## Problem Statement

The Ready team has no unified view of what's happening across GTM, agent work, research, and team status. Mario does a lot of work across multiple channels and systems — GTM briefs, Slack signals, X posts, research digests — but there's no single place the team can open to see what's been done, what's live, and what's coming next. The team currently relies on Slack threads, Notion pages, and tribal knowledge to track progress.

## Solution

Mission Control is a web app — accessible to anyone with a @ready.co email — that serves as the team's all-in-one operations dashboard. It shows a live activity feed of what Mario (and future agents) have been working on, with room to grow into GTM launches, research signals, team status, and external channel states over time.

The product starts small and keeps building. No MVP framing — just ship and iterate.

## User Stories

1. As a Ready team member, I want to open a web app and see what Mario has been working on in the past week, so that I can stay informed without asking Mario directly.
2. As a Ready team member, I want to see a reverse-chronological feed of agent activities with descriptions and links, so I can quickly understand what happened and jump to the relevant source.
3. As a Ready team member with a @ready.co email, I want to log in with Google OAuth, so that access is seamless and secure without separate credentials.
4. As the Mario agent, I want to write an activity to Convex after completing a significant action, so that the dashboard stays up to date in real time.
5. As the team grows, I want new agents to be able to write to the same activity feed, so the dashboard reflects work across all agents.
6. As the team matures, I want to add new data types (GTM launches, research signals, team status, external channels) without restructuring the foundation.
7. As a developer, I want to understand the domain language and decisions behind Mission Control, so I can contribute without decoding context.

## Implementation Decisions

### Stack
- **Frontend**: Next.js, deployed on Vercel
- **Database + Auth**: Convex — reactive DB with built-in Google OAuth for @ready.co email authentication
- **Write path**: Mario calls a Convex mutation directly after completing significant actions

### Data Model

**activities** table — single table for Phase 1:

```typescript
{
  id: Id<string>,          // Convex system field
  type: string,             // e.g. "gtm-brief", "research-signal", "slack-alert", "post-sent"
  description: string,     // human-readable summary of what happened
  url?: string,            // optional link to the source (Notion page, Slack thread, X post)
  timestamp: number,       // Unix milliseconds when the activity occurred
  agent: string            // "mario" for now; extensible for future agents
}
```

### Convex Schema
- One `activities` table with the fields above
- One mutation: `addActivity(type, description, url?, agent)` — called by Mario after significant actions
- One query: `listActivities()` — returns reverse-chronological feed, subscribed to by the dashboard

### Auth
- Google OAuth via Convex Auth
- Anyone with a @ready.co email can access (no allowlist)
- Read-only for team members; write path is agent-only via Convex API key

### Frontend Pages (Phase 1)
- `/` — activity feed (reverse-chronological list of activities with type badges, descriptions, timestamps, and links)
- `/login` — handled by Convex Auth automatically redirecting to Google OAuth

### Principles
- Start with the activity feed only — no GTM launches, research signals, team status, or external channels yet
- Build iteratively — add tables and features as the product matures
- Activity types are strings for now — no enum yet, let the schema evolve as we learn what types actually appear

## Testing Decisions

- **External behavior only** — tests verify the activity feed renders correctly and the Convex mutation writes what it should, not the internal implementation
- **Activity feed rendering** — verify the page loads with activities sorted reverse-chronologically, type badges show correctly, links open in new tab
- **Mutation** — verify `addActivity` writes the correct fields to Convex and the feed updates live via Convex subscriptions
- Prior art: standard Next.js + Convex integration patterns

## Out of Scope

- GTM launches view
- Research signals view
- Team status / standup view
- External channels (X, email, paid ads) status
- Any kanban-style boards
- Non-@ready.co email access

## Further Notes

- The "significant action" threshold for writing an activity is intentionally undefined — Mario will use judgment. If the feed is too noisy, we add filtering later.
- Convex free tier (1M function calls/month, 0.5GB storage) should be sufficient for Phase 1. Monitor usage as the team and agent count grows.
- Auth is Google OAuth only — no username/password. Convex handles the OAuth flow.