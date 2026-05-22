# Convex as the reactive database for Mission Control

We are using Convex as the primary database and real-time engine for Mission Control.

**Context:** Mission Control needs live updates (dashboard refreshes as Mario writes), Google OAuth for @ready.co emails, and a schema that can evolve as we add GTM launches, research signals, and team status. The team wanted either Convex or better-sqlite3.

**Decision:** Convex.

**Why:**
- Native reactive subscriptions — clients subscribe to queries and get live updates without polling or SSE wiring
- Built-in Google OAuth — zero extra auth infrastructure
- Generous free tier (1M function calls, 0.5GB storage) — enough for Phase 1
- TypeScript-first — aligns with Next.js frontend
- Schema can evolve — add tables as we expand beyond the MVP activity feed

**Considered alternatives:**
- **better-sqlite3 + DIY SSE** — full control, but requires building a subscription layer from scratch. Doable but adds unnecessary complexity for Phase 1.
- **Supabase** — also a good option, but Convex's reactive model is purpose-built for exactly this use case (live dashboard updates), which Supabase doesn't handle as elegantly.

**Consequences:**
- Convex is a hosted service — dependency on their infrastructure and pricing model. If costs scale significantly, migration to self-hosted SQLite would require rewriting the write path and subscription layer.
- Mario writes via Convex mutation API — requires the Convex client to be available in the execution environment.