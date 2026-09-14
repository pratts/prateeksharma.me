# Content Backlog

Generated during a content/quality pass over the whole site. Items here need
your judgment, personal history, or new material; nothing in this file was
invented to fill a gap. Where I already made a fix instead of just flagging it,
it's noted separately in the session's final report, not here.

---

## High Priority

### [ ] Books section has no real books

**Page:** `/books/`, `/books/reviews/`, `/books/reading-list/`

**Problem:** The bookshelf previously contained 5 "starter" book entries
(Designing Data-Intensive Applications, Database Internals, Understanding
Distributed Systems, The Go Programming Language, Release It!) that I had added
in an earlier pass as placeholder content, all `want-to-read`, all dated
identically, all with `TODO: Add review / notes once read.` bodies. That's
exactly the kind of default/generic content this pass was supposed to catch, so
I removed all five rather than leave invented reading intent on the site. The
Bookshelf, Reviews, and Reading List pages now show clean, honest empty states
instead.

**Recommended improvement:** Add your actual books; even a handful with real
status/rating/notes will make the section feel personal rather than templated.

**User input required:** Your real reading list and any reviews/ratings you
want public. Run `hugo new books/the-book-title/index.md` per book (see README
"Add a book"). If any of the five removed titles genuinely are on your list,
re-adding them with your own note is fine, they just shouldn't be presented as
already curated by default.

---

### [ ] Open Source section has only one entry

**Page:** `/open-source/`

**Problem:** The only entry is a personal OpenVoice fork explicitly marked "not
submitted upstream," which is honest but thin for a whole section, and it's not
really a *contribution accepted by* another project, more a documented fork.

**Recommended improvement:** If you have other real PRs, issues, or discussions
on projects you don't own, add them (`hugo new open-source/what-i-did.md`). If
this is genuinely the only one right now, that's fine to leave as-is; I'm
flagging it so it's a conscious choice rather than an oversight.

**User input required:** A list of any other real external contributions worth
documenting, with links.

---

### [ ] WazirX co-founder acknowledgement: any public source?

**Page:** `/projects/wazirx-connector-go/`, `/projects/wazirx-connector-java/`

**Problem:** Both pages state the library "has been acknowledged by WazirX's
co-founder." Per your instructions this claim stays (you have direct evidence),
and I did not weaken or remove it. I did not add a link because I have no
public source for it, and I was told not to invent one or expose private email
content.

**Recommended improvement:** If there's ever a public reference (a tweet, a
GitHub issue/PR comment, a public reply), send me the link and I'll cite it
directly instead of the current unlinked claim.

**User input required:** A public URL, if one exists. Otherwise no action
needed, the current wording is intentionally conservative already.

---

### [ ] Tidylnk project page is thin compared to the others

**Page:** `/projects/tidylnk/`

**Problem:** Every other featured project (Goroomlib, both WazirX connectors,
TTS Study Assistant) documents a specific technical decision or trade-off.
Tidylnk currently only has "tech stack" and "why I built it," no interesting
engineering decisions, so it reads noticeably thinner next to its neighbors.

**Recommended improvement:** Expand into a short case study if there's
material. Candidate angles, only if genuinely true:

1. Why Redis specifically on the redirect hot path (cache strategy, key
   design, TTLs, invalidation on link edit/delete).
2. Admin panel auth design (sessions vs. JWT, how it differs from the
   redirect path's requirements).
3. Anything about the Docker/Railway deployment that wasn't just "containerize
   and deploy" (health checks, zero-downtime deploys, environment config).
4. Any measured redirect latency numbers, only if you actually have them.

**User input required:** Which of these (if any) actually happened, plus any
detail safe to publish. I won't draft this without source material.

---

### [ ] Confirm current facts are still current

**Page:** `/experience/cointracker/`, `data/profile.yaml`

**Problem:** CoinTracker's `end` date is set to "Apr 2026," and the sidebar
status says "Open to engineering roles." Depending on when you read this, both
may need updating (new role started, end date confirmed/changed, or status
should flip to something else).

**Recommended improvement:** A quick pass to confirm dates and status reflect
where things actually stand right now.

**User input required:** Current employment status and any date corrections.

---

## Medium Priority

### [ ] Consider expanding the composite-index Note into a short Blog post

**Page:** `/notes/index-column-order-should-match-the-filter/`

**Current type:** Note

**Suggested change:** Optionally expand into a Blog post, but only if you have
a real worked example.

**Why:** The underlying idea (composite index column order should match the
query shape) is a genuinely meaty topic with room for a fuller treatment:
`EXPLAIN ANALYZE` before/after, covering indexes, when a second index beats a
wider composite one. The current Note states the rule correctly but doesn't
have room to show it.

**Potential structure:**
1. The query pattern that drove the index
2. What a left-prefix actually means, concretely
3. `EXPLAIN ANALYZE` output showing index vs. sequential scan
4. When to reach for a different index shape entirely (partial, covering)
5. Lessons learned

**Potential diagram:** A simple B-tree traversal illustration showing why a
left-prefix match works and a non-prefix match doesn't.

**User input required:** Real `EXPLAIN ANALYZE` output or a concrete second
example from your own work. Without that, this stays a Note; it's fine as one.

---

### [ ] Architecture diagrams for the two most narrative-heavy projects

**Page:** `/projects/goroomlib/`, `/projects/wazirx-connector-go/`

**Problem:** Both are strong, near-case-study writeups already, but both are
pure prose/code. A small diagram would help a skimming reader.

**Recommended improvement:**
- Goroomlib: a simple box diagram of `RoomService` / `UserService` and the
  `RoomExtension` / `AppExtension` hook points.
- WazirX Go Connector: a small sequence diagram of `call()` → sign (if needed)
  → dispatch by HTTP verb → parse response.

**User input required:** None strictly, I can draft an SVG/Mermaid diagram from
the existing code samples on the page if you want one. Flagging here rather
than doing it unprompted since it's a content addition, not a fix.

---

### [ ] Tag consolidation follow-through

**Problem:** While auditing taxonomy I found and fixed three inconsistent tag
spellings that were splitting one concept across two tags (`REST API` vs.
`REST APIs`; `API` + `REST` as separate tags on the same post alongside `API
Design`; `Library` vs. `Libraries`). Those are fixed. The tag list still has
~60 tags across ~20 pieces of content, most used exactly once (e.g. `Fiber`,
`GORM`, `Vite`, `Chalice`-adjacent one-offs). That's not wrong, just worth
knowing.

**Recommended improvement:** No action needed now. As you add more content,
prefer reusing an existing tag over minting a near-duplicate (e.g. don't add
`Distributed System` if `Distributed Systems` already exists) so tag pages stay
useful aggregations rather than one-off buckets.

**User input required:** None. Informational.

---

## Low Priority

### [ ] Homepage "Books" section will show an empty state until books exist

**Page:** `/` (homepage)

**Problem:** With the Bookshelf empty (see High Priority item above), the
homepage's Books section now renders a plain "Nothing on the shelf yet."
message rather than book covers.

**Recommended improvement:** No action needed. Once real books exist, this
section fills in automatically. If you'd rather hide the section entirely
until then, remove the `books` entry from `data/home.yaml`'s `sections` list
and re-add it later, one line, no template change.

**User input required:** None unless you want it hidden meanwhile.

---

### [ ] Adda52 / Mind Sports League tag naming: Angular 2 vs. AngularJS

**Page:** `/experience/adda52/`, `/experience/mind-sports-league/`

**Problem:** Adda52's tags use "Angular 2" and Mind Sports League's use
"AngularJS." These are technically different frameworks (Angular 2+ vs. the
1.x AngularJS line), so this may be entirely correct and I did not change it,
but I can't independently verify which framework was actually used where.

**Recommended improvement:** Confirm both are accurate as written. If Mind
Sports League's simulator was actually built in Angular 2 (not classic
AngularJS), let me know and I'll correct the tag.

**User input required:** Confirmation of which Angular version was used at
each company.

---

## Potential Future Articles

All sourced from experience, projects, or interests already documented on the
site. None of these are drafted; they're starting points for when you want to
write.

### 1. Why I prefer idempotent workflows for external data sync

**Source material:** CoinTracker experience, Temporal wallet-sync workflows.
**Why it's worth writing:** You already do this in production; the "endpoint
maps" and "two exceptions" posts show you write well about a specific decision
and its trade-off. This is the same shape, applied to workflow design.
**Rough outline:** 1) the problem with best-effort sync scripts, 2) failure
modes when a sync job doubles-up on retry, 3) what idempotency means at the
workflow-step level, 4) Temporal's retry/replay model and what it buys you,
5) reconciliation as a backstop rather than the primary correctness mechanism,
6) trade-offs (latency, complexity) 7) lessons learned.

### 2. One blockchain abstraction, five chains

**Source material:** CoinTracker's Cardano/Stellar/Akash/Axelar/Bitcoin
Ordinals integrations behind a unified abstraction.
**Why it's worth writing:** "Onboarding a new chain became a smaller, more
predictable piece of work" is a concrete, specific claim worth unpacking, how
the abstraction is actually shaped.
**Rough outline:** 1) what's genuinely different between chains (data model,
finality, address formats), 2) what the abstraction had to hide vs. what it
had to expose, 3) a worked example of adding the Nth chain, 4) where the
abstraction leaked and had to be special-cased.

### 3. Multi-tenant Postgres: one schema, tenant-level isolation

**Source material:** Emission Critical's multi-tenant PostgreSQL schema + RBAC.
**Why it's worth writing:** Multi-tenancy schema design (shared schema with a
tenant column vs. schema-per-tenant vs. database-per-tenant) is a perennial,
highly-searched backend topic, and you actually shipped one.
**Rough outline:** 1) the three common approaches and why you picked one,
2) what tenant isolation had to guarantee, 3) how Auth0 fed into row-level
enforcement, 4) a mistake or near-miss if there was one, 5) what you'd do
differently at 10x the tenant count.

### 4. What load-testing a real-money poker server at 10k+ concurrent users looks like

**Source material:** Adda52 load and resilience testing.
**Why it's worth writing:** Concrete, high-concurrency real-time systems
content is rare and this is a genuinely unusual domain (real-money gaming).
**Rough outline:** 1) what a Java-based user-behavior simulator actually
simulates, 2) what broke first under load, 3) how disaster recovery ties into
load testing, 4) restoring game/player state after a failure, what "correct"
even means there.

### 5. Migrating a public gaming platform from PHP to Node.js

**Source material:** Adda52 platform migration.
**Why it's worth writing:** Migration war stories are consistently useful to
readers; yours has a clear before/after and a stated outcome (performance,
maintainability).
**Rough outline:** 1) why PHP became the bottleneck, 2) migration strategy
(big-bang vs. incremental, which you did), 3) what had to be true before
cutover, 4) what broke anyway, 5) what you'd verify earlier next time.

### 6. Full-text search over a reference dataset with Meilisearch

**Source material:** Emission Critical's Meilisearch-backed emission-factor
search.
**Why it's worth writing:** "Why not just Postgres full-text search" is a
question a lot of backend engineers hit; you made a concrete choice.
**Rough outline:** 1) the dataset shape and query patterns, 2) what Postgres
FTS would have needed to do the same job, 3) why Meilisearch won for this case,
4) indexing/sync strategy (how the search index stays consistent with Postgres),
5) trade-offs you accepted.

### 7. Reconnection and auth-token caching for exchange WebSocket streams

**Source material:** WazirX Java connector, expanding past the existing
daemon-thread Note.
**Why it's worth writing:** The existing Note and project page cover two
narrow decisions well; there's room for the fuller picture of the WebSocket
client's lifecycle.
**Rough outline:** 1) connect/subscribe/ping lifecycle, 2) what happens on
disconnect (reconnect strategy, backoff), 3) the auth-token caching fix
already documented, 4) what a caller sees during a reconnect, 5) what's still
fragile.

### 8. Running open-source ML tooling on Apple Silicon instead of CUDA

**Source material:** Video Translator + Audio Cloning (Whisper, demucs,
OpenVoice, MeloTTS all assuming CUDA).
**Why it's worth writing:** Practical "porting a CUDA-first tool to CPU/Apple
Silicon" content is genuinely useful and under-written; you did this across
multiple libraries in one project.
**Rough outline:** 1) which assumptions broke (device selection, precision,
missing kernels), 2) the specific patches needed per library, 3) the
performance cost of CPU inference and whether it was viable, 4) what you'd
tell someone starting the same port today.

### 9. Observability for a small backend team: OpenTelemetry + SigNoz

**Source material:** Emission Critical's observability stack.
**Why it's worth writing:** "How I actually instrumented a small team's
backend," concretely, is more useful than generic observability advice.
**Rough outline:** 1) what you couldn't answer before instrumenting, 2) what
you chose to trace vs. log vs. alert on, 3) SigNoz + Kubernetes-native logging
setup specifics, 4) a real incident the instrumentation actually helped
diagnose (only if one is safe to describe without confidential detail).

### 10. How I actually use Claude Code as an engineer, not a replacement

**Source material:** CoinTracker's agentic-development workflow.
**Why it's worth writing:** This is explicitly a topic worth surfacing per
your own instructions, and it differentiates you in a way a bare résumé bullet
can't. There's real appetite right now for engineers describing their actual
AI-assisted workflow rather than either dismissing or overselling it.
**Rough outline:** 1) what kind of tasks you hand off vs. keep, 2) how review
and validation actually happens (tests, reading every diff, whatever's true),
3) a concrete example of debugging or feature work where it helped and one
where it didn't, 4) what "engineering ownership" means in this workflow,
5) where you'd be cautious extending this further.

---

## Already Fixed This Pass

For context, not action items. See the session report for the full list;
summarized here so this file doesn't duplicate it:

- Removed 5 fabricated "starter" book entries and rewrote Bookshelf/Reviews/
  Reading List empty states to be honest and reader-facing instead of
  developer instructions exposed to visitors.
- Site-wide empty-state copy (homepage sections, section listing pages)
  simplified to plain, reader-appropriate messages.
- Replaced 83 em dashes across all content, plus a handful in rendered
  template/data strings, with normal punctuation.
- Fixed an unsupported empirical claim in "Two-sided membership needs one
  lock, not two" (implied the race was observed in production; softened to
  the mechanism, which is what the source material actually supports).
- Fixed three inconsistent tag spellings (`REST API`/`REST APIs`, `API`+`REST`
  as separate tags on one post, `Library`/`Libraries`).
- Removed an orphaned, unused `intro` field from `data/profile.yaml` (dead
  configuration, never rendered by any template).
- Strengthened the CoinTracker Claude Code bullet to explicitly name
  review/validation against the existing test suite, rather than a bare
  "adopted as an agentic assistant" mention.
