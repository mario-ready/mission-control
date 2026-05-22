# Mission Control Mario World Spec

Mission Control uses a Super Mario-style world as a product map. Props are not just decoration: each Mario game element represents a dashboard feature, data type, product state, or interaction pattern.

## Concept

**Mario world = Mission Control product map**

Mario explores the dashboard like a side-scrolling level. Each object in the level has semantic meaning:

- work items become interactive game objects
- dashboard sections become pipes/worlds
- priorities become power-ups
- progress becomes coins/flagpoles/castles

The goal is to make Mission Control feel playful and memorable while preserving clear operational meaning.

## Prop Semantics

### `?` Blocks — Activities

- Represents individual activities from the Convex `activities` table.
- Jump/bump to reveal activity detail.
- Click/tap also opens the activity detail.
- Used block means the activity has already been viewed in the current session.
- Coin burst means “new info unlocked.”

### Bricks — Grouped Activity Clusters / Filters

Bricks represent category filters or clusters:

- GTM
- Research
- Social
- Slack / Signals
- Ops

Interactions:

- Hitting a brick can apply a category filter.
- Brick rows can label sections of the world.
- Some bricks can be breakable later for hidden/advanced filters.

### Pipes — Major Sections / Future Dashboards

Pipes represent dashboard sections or future product areas:

- Green pipe: Activity Feed
- Red pipe: GTM Launches
- Blue pipe: Research Signals
- Yellow pipe: Team Status
- Gray pipe: External Channels

Interactions:

- Entering a pipe navigates to, or filters into, that feature area.
- Locked pipes show sections that are planned but not built yet.
- Unlocked pipes can animate or glow.

### Coins — Activity Count / Completed Work

- Total coins represent activity volume, usually for the current week.
- Coin trails can guide Mario toward new or important items.
- Collecting coins can mark activities as viewed or acknowledged.

### Stars — Important / High-Impact Activities

Stars represent standout moments:

- campaign shipped
- major launch milestone
- important research finding
- high-value customer or market signal

Stars should pulse or sparkle more than normal activity blocks.

### Mushrooms — Growth / Opportunity Signals

Mushrooms represent growth-oriented findings:

- ICP clues
- research insights
- campaign learnings
- customer opportunities
- expansion signals

### Fire Flowers — Urgent Alerts

Fire Flowers represent time-sensitive or urgent signals:

- Slack alerts
- hot leads
- production-impacting issues
- urgent GTM actions

### Castles — Milestones

Castles represent major completed milestones:

- campaign launch completed
- GTM sprint completed
- weekly digest ready
- big release shipped

### Flagpole — Weekly Goal / Progress

The flagpole represents weekly progress.

- Reaching the flagpole opens the weekly digest.
- Flag height can indicate KPI progress.
- End-of-level moment summarizes what happened, what matters, and what’s next.

## World Layout

### World 1-1 — Activity Feed

Current Phase 1 world.

- Reverse-chronological activity feed represented as `?` blocks.
- Mario walks through recent activities.
- Bumping blocks opens activity details.

### World 1-2 — GTM Launches

Future world.

- Pipe / underground aesthetic.
- Campaigns represented as platforms or pipe routes.
- Launch status shown through checkpoints and castles.

### World 1-3 — Research Signals

Future world.

- Sky/platform aesthetic.
- Signals represented as mushrooms, stars, and floating platforms.
- Clusters of related research can appear as cloud islands.

### World 1-4 — Exec / Weekly Summary

Future world.

- Castle aesthetic.
- Boss-room style executive summary.
- Shows: what happened, what matters, what’s next.

## Interaction Model

- Mario walks through the dashboard.
- Jump into `?` block → open activity modal.
- Enter pipe → navigate/filter to feature section.
- Collect coins → mark items viewed.
- Hit category brick → filter world.
- Reach flagpole → open weekly digest.
- Star blocks pulse for high-priority items.

## Implementation Plan

### Phase A — Make Props Semantic

Goal: add meaning to existing props without changing the backend schema.

Tasks:

- Keep current world structure.
- Add a Mario-style legend explaining prop meanings.
- Map activity types to Mario item visuals.
- Add semantic pipes for future sections.
- Add category bricks for filters/categories.
- Keep locked/unbuilt sections visually distinct.

### Phase B — Add Navigation

Goal: make world props control the dashboard.

Tasks:

- Pipes become selectable destinations.
- Bricks become category filters.
- Flagpole opens weekly summary.
- Add visible active-filter state.
- Add keyboard/touch affordances for pipe entry.

### Phase C — Add State

Goal: make interactions persistent and operationally useful.

Tasks:

- Track viewed/unviewed activities.
- Highlight new activities with sparkle or animation.
- Add weekly coin/progress counters.
- Consider storing per-user read state after auth is implemented.

### Phase D — Multi-World Dashboard

Goal: expand from one activity feed world to multiple product worlds.

Worlds:

- Activity Feed
- GTM Launches
- Research Signals
- Team Status
- External Channels

Each world should have a distinct Mario-inspired theme and semantic prop mapping.

## Near-Term Recommendation

Implement **Phase A** next:

1. Add semantic pipes.
2. Add category bricks.
3. Add a Mario-style legend.
4. Map activity types to visible item styles.
5. Avoid backend schema changes until the interaction model is validated.
