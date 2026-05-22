# Mission Control

Marketing and operations dashboard for Ready team — an all-in-one view of GTM activity, agent work, research signals, team status, and external channels.

## Language

**Activity**:
A discrete unit of work produced by an agent (Mario or future agents). Has a type, description, optional link, and timestamp.
_Avoid_: task, action, event

**Dashboard**:
Read-only view for Ready team members. Shows the reverse-chronological activity feed and eventually GTM launches, research signals, team status, and external channel states.
_Avoid_: panel, control center

**Mission Control**:
The product itself — the all-in-one dashboard app.
_Avoid_: Mario dashboard, ops dashboard

**Write path**:
Mario writes directly to Convex via a mutation API call after completing a significant action.
_Avoid_: sync path, data pipeline

## Resolved Decisions

- **DB**: Convex (live reactive DB, Google OAuth for ready.co email auth)
- **Frontend**: Next.js, deployed on Vercel
- **Auth**: Google OAuth — anyone with @ready.co email can access (no allowlist)
- **Phase 1 MVP scope**: Single `activities` table in Convex. One `addActivity` mutation. Reverse-chronological feed only. No GTM launches, research signals, team status, or external channels yet.
- **Activity schema**: `{id, type, description, url?, timestamp}`

## Flagged Ambiguities

- What constitutes a "significant action" worth recording as an activity? (threshold not yet defined — Mario will use judgment for now)